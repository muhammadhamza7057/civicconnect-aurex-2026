const Ticket = require('../models/Ticket');
const Department = require('../models/Department');
const User = require('../models/User');

async function getSystemAnalytics(req, res) {
  try {
    // Only Super Admin
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Access denied: Super Admin only' });
    }

    const [
      totalTickets,
      statusCounts,
      priorityCounts,
      deptCounts
    ] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Ticket.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Ticket.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept_info' } },
        { $unwind: '$dept_info' },
        { $project: { name: '$dept_info.name', count: 1 } }
      ])
    ]);

    return res.json({
      success: true,
      data: {
        totalTickets,
        statusCounts,
        priorityCounts,
        deptCounts
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
      staffPerformance
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
        { $project: { name: '$user_info.full_name', count: 1 } }
      ])
    ]);

    return res.json({
      success: true,
      data: {
        totalTickets,
        statusCounts,
        priorityCounts,
        staffPerformance
      }
    });
  } catch (err) {
    console.error('getDepartmentAnalytics error', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch department analytics' });
  }
}

module.exports = {
  getSystemAnalytics,
  getDepartmentAnalytics
};
