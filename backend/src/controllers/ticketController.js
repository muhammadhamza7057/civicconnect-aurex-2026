const { validationResult } = require('express-validator');
const Ticket = require('../models/Ticket');
const TicketComment = require('../models/TicketComment');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const { nextTicketCode } = require('../utils/ticketIdGenerator');
const { computeSLA } = require('../services/slaService');
const { uploadFiles } = require('../services/uploadService');
const { getIO } = require('../lib/socket');
const { enqueueTicketAI } = require('../jobs/queue');
const { notifyUser } = require('../lib/notify');

function emitTicket(io, event, payload) {
  io && io.emit(event, payload);
  if (event !== 'ticket:updated') {
    io && io.emit('ticket:updated', payload);
  }
  const aliases = {
    'ticket:created': 'ticket_created',
    'ticket:updated': 'ticket_updated',
    'ticket:assigned': 'ticket_assigned',
    'ticket:statusChanged': 'ticket_updated',
    'ticket:commentAdded': 'comment_added'
  };
  const alias = aliases[event];
  if (alias) io && io.emit(alias, payload);
}

function getEntityId(value) {
  if (!value) return null;
  if (typeof value === 'object' && value._id) return value._id.toString();
  return value.toString();
}

function canManageDepartmentTicket(user, ticket) {
  if (!user || !ticket) return false;
  if (user.role === 'super_admin') return true;
  const ticketDepartmentId = getEntityId(ticket.department);
  const userDepartmentId = getEntityId(user.department);
  if (!ticketDepartmentId || !userDepartmentId) return false;
  return ticketDepartmentId === userDepartmentId;
}

function ticketPopulation() {
  return [
    { path: 'reporter', select: 'name email role staff_id' },
    { path: 'assigned_to', select: 'name email role staff_id' },
    { path: 'department', select: 'name slug' }
  ];
}

function parseLocation(raw) {
  if (raw == null) return null;
  let loc = raw;
  if (typeof loc === 'string') {
    try {
      loc = JSON.parse(loc);
    } catch (_) {
      return null;
    }
  }
  if (typeof loc !== 'object') return null;
  const lat = Number(loc.lat);
  const lng = Number(loc.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng, text: loc.text || '' };
}

async function notifyDepartmentStaff(departmentId, message, type, meta) {
  if (!departmentId) return;
  const staff = await User.find({ role: 'staff', department: departmentId }).select('_id').lean();
  await Promise.all(staff.map(s => notifyUser(s._id, message, type, meta)));
}

async function createTicket(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const validationErrors = errors.array();
      return res.status(400).json({
        success: false,
        message: validationErrors[0]?.msg || 'Please fill all required fields',
        code: 'validation_failed',
        details: validationErrors,
        errors: validationErrors
      });
    }

    const { title, description, priority = 'medium' } = req.body;
    const department = req.body.department || req.body.department_id;
    const location = parseLocation(req.body.location);

    const files = req.files || [];
    if (files.length > 5) return res.status(400).json({ success: false, message: 'Max 5 attachments allowed' });
    const attachments = await uploadFiles(files);

    const ticket_code = await nextTicketCode('INF');
    const { slaDeadline, slaStatus } = computeSLA(priority);

    const metadata = { slaStatus, ...(location ? { location } : {}) };

    const ticketData = {
      ticket_code,
      title,
      description,
      reporter: req.user._id,
      department: department || null,
      priority,
      attachments,
      sla_due_at: slaDeadline,
      metadata,
      location: location || undefined
    };

    const ticket = await Ticket.create(ticketData);

    await AuditLog.create({
      action: 'ticket_created',
      user_id: req.user._id,
      resourceType: 'ticket',
      resourceId: ticket._id,
      metadata: { ticket_id: ticket_code }
    });

    const io = getIO();
    emitTicket(io, 'ticket:created', {
      ticket: {
        id: ticket._id,
        ticket_id: ticket_code,
        ticket_code,
        title,
        priority,
        status: ticket.status,
        department_id: ticket.department
      }
    });

    await notifyDepartmentStaff(
      ticket.department,
      `New ticket ${ticket_code}: ${title}`,
      'ticket:created',
      { ticket_id: ticket._id }
    );

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

    if (req.user.role === 'admin' || req.user.role === 'staff') {
      if (req.user.department) filter.department = req.user.department;
    }

    const [data, total] = await Promise.all([
      Ticket.find(filter).populate(ticketPopulation()).sort({ createdAt: -1 }).skip(skip).limit(Number(per_page)).lean(),
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
      Ticket.find(filter).populate(ticketPopulation()).sort({ createdAt: -1 }).skip(skip).limit(Number(per_page)).lean(),
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
    const ticket = await Ticket.findById(req.params.id).populate(ticketPopulation()).lean();
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    if (req.user.role === 'resident') {
      if (!ticket.reporter || ticket.reporter._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied: Resident can only view own tickets' });
      }
    } else if (req.user.role === 'staff') {
      if (!canManageDepartmentTicket(req.user, ticket)) {
        return res.status(403).json({ success: false, message: 'Access denied: Staff can only view tickets in their department' });
      }
    } else if (req.user.role === 'admin') {
      if (!canManageDepartmentTicket(req.user, ticket)) {
        return res.status(403).json({ success: false, message: 'Access denied: Admin can only view tickets in their department' });
      }
    }

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

    if (req.user.role === 'resident') return res.status(403).json({ success: false, message: 'Insufficient permissions' });

    if (req.user.role === 'staff' && !canManageDepartmentTicket(req.user, ticket)) {
      return res.status(403).json({ success: false, message: 'Staff can only update tickets in their department' });
    }

    if (req.user.role === 'admin' && !canManageDepartmentTicket(req.user, ticket)) {
      return res.status(403).json({ success: false, message: 'Admin can only update tickets in their department' });
    }

    ticket.status = status;
    await ticket.save();

    await AuditLog.create({
      action: 'status_changed',
      user_id: req.user._id,
      resourceType: 'ticket',
      resourceId: ticket._id,
      metadata: { status }
    });

    const io = getIO();
    emitTicket(io, 'ticket:statusChanged', { ticketId: ticket._id, status, ticket: ticket.toObject?.() || ticket });

    if (ticket.reporter) {
      await notifyUser(
        ticket.reporter,
        `Ticket ${ticket.ticket_code} is now ${status.replace(/_/g, ' ')}`,
        'ticket:updated',
        { ticket_id: ticket._id }
      );
    }

    return res.json({ success: true, data: ticket });
  } catch (err) {
    console.error('updateTicketStatus error', err);
    return res.status(500).json({ success: false, message: 'Failed to update status' });
  }
}

async function escalateTicket(req, res) {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    if (!['staff', 'admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    if (req.user.role === 'staff' && !canManageDepartmentTicket(req.user, ticket)) {
      return res.status(403).json({ success: false, message: 'Staff can only escalate tickets in their department' });
    }

    if (req.user.role === 'admin' && !canManageDepartmentTicket(req.user, ticket)) {
      return res.status(403).json({ success: false, message: 'Wrong department' });
    }

    ticket.status = 'escalated';
    await ticket.save();

    await AuditLog.create({
      action: 'escalated',
      user_id: req.user._id,
      resourceType: 'ticket',
      resourceId: ticket._id,
      metadata: {}
    });

    const io = getIO();
    emitTicket(io, 'ticket:statusChanged', { ticketId: ticket._id, status: 'escalated', ticket: ticket.toObject?.() || ticket });

    return res.json({ success: true, data: ticket });
  } catch (err) {
    console.error('escalateTicket error', err);
    return res.status(500).json({ success: false, message: 'Escalation failed' });
  }
}

async function assignTicketToStaff(req, res) {
  try {
    const { assigneeId } = req.body;
    if (!assigneeId) return res.status(400).json({ success: false, message: 'Missing assigneeId' });

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    if (!['staff', 'admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    if (req.user.role !== 'super_admin' && !canManageDepartmentTicket(req.user, ticket)) {
      return res.status(403).json({ success: false, message: 'Can only assign tickets in your department' });
    }

    ticket.assigned_to = assigneeId;
    ticket.status = 'assigned';
    await ticket.save();

    await AuditLog.create({
      action: 'assigned',
      user_id: req.user._id,
      resourceType: 'ticket',
      resourceId: ticket._id,
      metadata: { assigneeId }
    });

    const io = getIO();
    emitTicket(io, 'ticket:assigned', { ticketId: ticket._id, assigneeId, ticket: ticket.toObject?.() || ticket });

    await notifyUser(
      assigneeId,
      `You were assigned ticket ${ticket.ticket_code}`,
      'ticket:assigned',
      { ticket_id: ticket._id }
    );

    return res.json({ success: true, data: ticket });
  } catch (err) {
    console.error('assignTicketToStaff error', err);
    return res.status(500).json({ success: false, message: 'Failed to assign ticket' });
  }
}

async function addTicketComment(req, res) {
  try {
    const message = req.body.message || req.body.body;
    if (!message) return res.status(400).json({ success: false, message: 'Missing message' });

    const visibility = req.body.visibility === 'internal' && ['staff', 'admin', 'super_admin'].includes(req.user.role)
      ? 'internal'
      : 'public';

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    if (req.user.role === 'resident' && ticket.reporter && ticket.reporter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const comment = await TicketComment.create({
      ticket_id: ticket._id,
      user_id: req.user._id,
      message,
      visibility
    });

    await AuditLog.create({
      action: 'comment_added',
      user_id: req.user._id,
      resourceType: 'ticket',
      resourceId: ticket._id,
      metadata: { commentId: comment._id, visibility }
    });

    const io = getIO();
    emitTicket(io, 'ticket:commentAdded', { ticketId: ticket._id, comment: { id: comment._id, message, visibility }, ticket: ticket.toObject?.() || ticket });

    if (visibility === 'public') {
      if (req.user.role === 'resident') {
        await notifyDepartmentStaff(
          ticket.department,
          `Resident replied on ticket ${ticket.ticket_code}`,
          'ticket:comment',
          { ticket_id: ticket._id, comment_id: comment._id }
        );
      } else if (ticket.reporter) {
        await notifyUser(
          ticket.reporter,
          `Staff replied on ticket ${ticket.ticket_code}`,
          'ticket:comment',
          { ticket_id: ticket._id, comment_id: comment._id }
        );
      }
    }

    return res.status(201).json({ success: true, data: comment });
  } catch (err) {
    console.error('addTicketComment error', err);
    return res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
}

async function getTicketTimeline(req, res) {
  try {
    const ticketId = req.params.id;
    const ticket = await Ticket.findById(ticketId).populate(ticketPopulation()).lean();
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    if (req.user.role === 'resident') {
      if (!ticket.reporter || getEntityId(ticket.reporter) !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    } else if (req.user.role === 'staff' || req.user.role === 'admin') {
      if (!canManageDepartmentTicket(req.user, ticket)) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    const commentFilter = { ticket_id: ticketId };
    if (req.user.role === 'resident') {
      commentFilter.visibility = 'public';
    }

    const [comments, audits] = await Promise.all([
      TicketComment.find(commentFilter).sort({ createdAt: 1 }).populate('user_id', 'name email role').lean(),
      AuditLog.find({ resourceType: 'ticket', resourceId: ticketId }).sort({ createdAt: 1 }).lean()
    ]);

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
  escalateTicket,
  assignTicketToStaff,
  addTicketComment,
  getTicketTimeline
};
