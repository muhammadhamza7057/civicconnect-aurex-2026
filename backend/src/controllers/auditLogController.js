const AuditLog = require('../models/AuditLog');

exports.listAuditLogs = async (req, res) => {
  try {
    const { page = 1, per_page = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(per_page);
    const [data, total] = await Promise.all([
      AuditLog.find().sort({ createdAt: -1 }).skip(skip).limit(Number(per_page)).populate('user_id', 'name email role').lean(),
      AuditLog.countDocuments()
    ]);
    return res.json({
      success: true,
      data: data.map(row => ({
        action: row.action,
        user_id: row.user_id,
        timestamp: row.createdAt,
        metadata: { ...row.metadata, resourceType: row.resourceType, resourceId: row.resourceId }
      })),
      meta: { total }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed' });
  }
};
