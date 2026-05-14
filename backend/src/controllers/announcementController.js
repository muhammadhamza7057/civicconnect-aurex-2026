const Announcement = require('../models/Announcement');

exports.listAnnouncements = async (req, res) => {
  try {
    const q = { starts_at: { $lte: new Date() }, $or: [{ ends_at: null }, { ends_at: { $gte: new Date() } }] };
    const items = await Announcement.find(q).sort({ createdAt: -1 }).limit(50).populate('author', 'name email role').lean();
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed to list announcements' });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, body, is_public = true, is_emergency = false, target_roles = [] } = req.body;
    if (!title || !body) return res.status(400).json({ success: false, message: 'title and body required' });
    const emergency = Boolean(is_emergency);
    if (emergency && req.user?.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Only super admin can post emergency announcements' });
    }
    const doc = await Announcement.create({
      title,
      body,
      author: req.user._id,
      is_public,
      is_emergency: emergency,
      target_roles: Array.isArray(target_roles) ? target_roles : [],
      metadata: { published_via: 'api' }
    });
    const io = require('../lib/socket').getIO();
    const payload = {
      id: doc._id,
      title: doc.title,
      body: doc.body,
      is_emergency: doc.is_emergency,
      createdAt: doc.createdAt
    };
    io && io.emit('announcement:published', payload);
    if (doc.is_emergency) io && io.emit('announcement:emergency', payload);
    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Create failed' });
  }
};
