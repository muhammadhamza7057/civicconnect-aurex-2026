const { validationResult } = require('express-validator');
const Ticket = require('../models/Ticket');
const TicketComment = require('../models/TicketComment');
const AuditLog = require('../models/AuditLog');
const { nextTicketCode } = require('../utils/ticketIdGenerator');
const { computeSLA } = require('../services/slaService');
const { uploadFiles } = require('../services/uploadService');
const { getIO } = require('../lib/socket');
const { enqueueTicketAI } = require('../jobs/queue');

async function createTicket(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { title, description, priority = 'medium', department, location } = req.body;

    // Handle attachments
    const files = req.files || [];
    if (files.length > 5) return res.status(400).json({ success: false, message: 'Max 5 attachments allowed' });
    const attachments = await uploadFiles(files);

    // Generate ticket code
    const ticket_code = await nextTicketCode('INF');

    // SLA
    const { slaDeadline, slaStatus } = computeSLA(priority);

    const ticketData = {
      ticket_code,
      title,
      description,
      reporter: req.user._id,
      department: department || null,
      priority,
      attachments,
      sla_due_at: slaDeadline,
      metadata: { slaStatus, location }
    };

    console.log('createTicket payload:', ticketData);
    const ticket = await Ticket.create(ticketData);

    // Audit log
    await AuditLog.create({ resourceType: 'ticket', resourceId: ticket._id, action: 'created', actor: req.user._id, payload: { ticket_code } });

    // Emit socket event for real-time updates
    const io = getIO();
    io && io.emit('ticket:created', { ticket: { id: ticket._id, ticket_code, title, priority, status: ticket.status } });

    // Queue AI processing without blocking the API response
    enqueueTicketAI(ticket._id.toString());

    return res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    console.error('createTicket error', err);
    return res.status(500).json({ success: false, message: 'Failed to create ticket', errors: [{ message: err.message }] });
  }
}

async function getAllTickets(req, res) {
  try {
    if (req.user.role === 'resident') {
      return res.status(403).json({ success: false, message: 'Residents must use /tickets/my' });
    }

    const { page = 1, per_page = 20, status, priority, q, department } = req.query;
    const skip = (Number(page) - 1) * Number(per_page);
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (department) filter.department = department;
    if (q) filter.$text = { $search: q };

    // RBAC: 
    // - Resident: Handled by /my or 403
    // - Super Admin: Unrestricted
    // - Department Admin: Full department scope
    // - Staff: Department scope + assigned tickets only
    if (req.user.role === 'department_admin') {
      if (req.user.department) filter.department = req.user.department;
    } else if (req.user.role === 'staff') {
      if (req.user.department) filter.department = req.user.department;
      filter.assigned_to = req.user._id;
    }

    const [data, total] = await Promise.all([
      Ticket.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(per_page)).lean(),
      Ticket.countDocuments(filter)
    ]);

    return res.json({ success: true, data, meta: { total } });
  } catch (err) {
    console.error('getAllTickets error', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
}

async function getMyTickets(req, res) {
  try {
    const { page = 1, per_page = 20, status, priority, q } = req.query;
    const skip = (Number(page) - 1) * Number(per_page);
    const filter = { reporter: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (q) filter.$text = { $search: q };

    const [data, total] = await Promise.all([
      Ticket.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(per_page)).lean(),
      Ticket.countDocuments(filter)
    ]);

    return res.json({ success: true, data, meta: { total } });
  } catch (err) {
    console.error('getMyTickets error', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch tickets' });
  }
}

async function getTicketById(req, res) {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('reporter assigned_to').lean();
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    // Access control
    if (req.user.role === 'resident') {
      if (!ticket.reporter || ticket.reporter._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied: Resident can only view own tickets' });
      }
    } else if (req.user.role === 'staff') {
      const isAssigned = ticket.assigned_to && ticket.assigned_to._id.toString() === req.user._id.toString();
      const inDepartment = ticket.department && ticket.department.toString() === req.user.department?.toString();
      if (!isAssigned || !inDepartment) {
        return res.status(403).json({ success: false, message: 'Access denied: Staff can only view assigned tickets in their department' });
      }
    } else if (req.user.role === 'department_admin') {
      const inDepartment = ticket.department && ticket.department.toString() === req.user.department?.toString();
      if (!inDepartment) {
        return res.status(403).json({ success: false, message: 'Access denied: Admin can only view tickets in their department' });
      }
    }
    // super_admin has unrestricted access

    return res.json({ success: true, data: ticket });
  } catch (err) {
    console.error('getTicketById error', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch ticket' });
  }
}

async function updateTicketStatus(req, res) {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'Missing status' });

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    // Only staff or above can change status
    if (req.user.role === 'resident') return res.status(403).json({ success: false, message: 'Insufficient permissions' });

    // Staff can only update their assigned tickets
    if (req.user.role === 'staff' && ticket.assigned_to?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Staff can only update status of assigned tickets' });
    }

    // Dept Admin can update any ticket in their department
    if (req.user.role === 'department_admin' && ticket.department?.toString() !== req.user.department?.toString()) {
      return res.status(403).json({ success: false, message: 'Admin can only update tickets in their department' });
    }

    ticket.status = status;
    await ticket.save();

    await AuditLog.create({ resourceType: 'ticket', resourceId: ticket._id, action: 'status_changed', actor: req.user._id, payload: { status } });

    const io = getIO();
    io && io.emit('ticket:statusChanged', { ticketId: ticket._id, status });

    return res.json({ success: true, data: ticket });
  } catch (err) {
    console.error('updateTicketStatus error', err);
    return res.status(500).json({ success: false, message: 'Failed to update status' });
  }
}

async function assignTicketToStaff(req, res) {
  try {
    const { assigneeId } = req.body;
    if (!assigneeId) return res.status(400).json({ success: false, message: 'Missing assigneeId' });

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    // permission: department_admin / super_admin only
    if (!['department_admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Only administrators can assign tickets' });
    }

    // Dept Admin can only assign tickets in their department
    if (req.user.role === 'department_admin' && ticket.department?.toString() !== req.user.department?.toString()) {
      return res.status(403).json({ success: false, message: 'Admin can only assign tickets in their department' });
    }

    ticket.assigned_to = assigneeId;
    ticket.status = 'assigned';
    await ticket.save();

    await AuditLog.create({ resourceType: 'ticket', resourceId: ticket._id, action: 'assigned', actor: req.user._id, payload: { assigneeId } });

    const io = getIO();
    io && io.emit('ticket:assigned', { ticketId: ticket._id, assigneeId });

    return res.json({ success: true, data: ticket });
  } catch (err) {
    console.error('assignTicketToStaff error', err);
    return res.status(500).json({ success: false, message: 'Failed to assign ticket' });
  }
}

async function addTicketComment(req, res) {
  try {
    const { body } = req.body;
    if (!body) return res.status(400).json({ success: false, message: 'Missing body' });

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    // Residents may only comment on their ticket or public
    if (req.user.role === 'resident' && ticket.reporter && ticket.reporter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const comment = await TicketComment.create({ ticket: ticket._id, author: req.user._id, body, public: true });
    await AuditLog.create({ resourceType: 'ticket', resourceId: ticket._id, action: 'comment_added', actor: req.user._id, payload: { commentId: comment._id } });

    const io = getIO();
    io && io.emit('ticket:commentAdded', { ticketId: ticket._id, comment: { id: comment._id, body } });

    return res.status(201).json({ success: true, data: comment });
  } catch (err) {
    console.error('addTicketComment error', err);
    return res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
}

async function getTicketTimeline(req, res) {
  try {
    const ticketId = req.params.id;
    const comments = await TicketComment.find({ ticket: ticketId }).sort({ createdAt: 1 }).lean();
    const audits = await AuditLog.find({ resourceType: 'ticket', resourceId: ticketId }).sort({ createdAt: 1 }).lean();
    return res.json({ success: true, data: { comments, audits } });
  } catch (err) {
    console.error('getTicketTimeline error', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch timeline' });
  }
}

module.exports = {
  createTicket,
  getAllTickets,
  getMyTickets,
  getTicketById,
  updateTicketStatus,
  assignTicketToStaff,
  addTicketComment,
  getTicketTimeline
};
