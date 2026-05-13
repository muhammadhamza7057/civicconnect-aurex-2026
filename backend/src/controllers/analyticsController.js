const Ticket = require('../models/Ticket');

async function slaBlock(filter = {}) {
  const now = new Date();
  const total = await Ticket.countDocuments(filter);
  const resolved = await Ticket.countDocuments({ ...filter, status: { $in: ['resolved', 'closed'] } });
  const open = await Ticket.countDocuments({ ...filter, status: { $nin: ['resolved', 'closed'] } });
  const breached = await Ticket.countDocuments({
    ...filter,
    sla_due_at: { $lt: now },
    status: { $nin: ['resolved', 'closed'] }
  });
  return {
    slaBreached: breached,
    slaOpenTickets: open,
    resolvedTickets: resolved,
    resolvedRatePct: total ? Math.round((resolved / total) * 1000) / 10 : 0,
    slaCompliancePct: open ? Math.max(0, Math.min(100, Math.round(((open - breached) / open) * 1000) / 10)) : 100
  };
}

async function getSystemAnalytics(req, res) {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Access denied: Super Admin only' });
    }

    const filter = {};
    const [
      totalTickets,
      statusCounts,
      priorityCounts,
      deptCounts,
      sla
    ] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Ticket.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Ticket.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept_info' } },
        { $unwind: { path: '$dept_info', preserveNullAndEmptyArrays: true } },
        { $project: { name: '$dept_info.name', count: 1 } }
      ]),
      slaBlock(filter)
    ]);

    return res.json({
      success: true,
      data: {
        totalTickets,
        statusCounts,
        priorityCounts,
        deptCounts,
        ...sla
      }
    });
  } catch (err) {
    console.error('getSystemAnalytics error', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch system analytics' });
  }
}

async function getDepartmentAnalytics(req, res) {
  try {
    const deptId = req.user.department;
    if (!deptId && req.user.role !== 'super_admin') {
      return res.status(400).json({ success: false, message: 'User not assigned to a department' });
    }

    const filter = deptId ? { department: deptId } : {};

    const [
      totalTickets,
      statusCounts,
      priorityCounts,
      staffPerformance,
      sla
    ] = await Promise.all([
      Ticket.countDocuments(filter),
      Ticket.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Ticket.aggregate([
        { $match: filter },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Ticket.aggregate([
        { $match: { ...filter, assigned_to: { $ne: null } } },
        { $group: { _id: '$assigned_to', count: { $sum: 1 } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user_info' } },
        { $unwind: '$user_info' },
        { $project: { name: '$user_info.name', count: 1 } }
      ]),
      slaBlock(filter)
    ]);

    return res.json({
      success: true,
      data: {
        totalTickets,
        statusCounts,
        priorityCounts,
        staffPerformance,
        ...sla
      }
    });
  } catch (err) {
    console.error('getDepartmentAnalytics error', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch department analytics' });
  }
}

async function exportTicketsCsv(req, res) {
  try {
    const filter = {};
    if (req.user.role === 'admin' || req.user.role === 'staff') {
      if (!req.user.department) return res.status(400).json({ success: false, message: 'No department' });
      filter.department = req.user.department;
    }
    if (req.user.role === 'staff') {
      filter.assigned_to = req.user._id;
    }

    const rows = await Ticket.find(filter).sort({ createdAt: -1 }).limit(2000).lean();
    const header = 'ticket_id,title,status,priority,department_id,sla_due_at,createdAt\n';
    const body = rows
      .map(t => {
        const dept = t.department ? t.department.toString() : '';
        return [t.ticket_code, JSON.stringify(t.title || ''), t.status, t.priority, dept, t.sla_due_at || '', t.createdAt].join(',');
      })
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="civicconnect-tickets.csv"');
    return res.send(header + body);
  } catch (err) {
    console.error('exportTicketsCsv error', err);
    return res.status(500).json({ success: false, message: 'Export failed' });
  }
}

module.exports = {
  getSystemAnalytics,
  getDepartmentAnalytics,
  exportTicketsCsv
};
