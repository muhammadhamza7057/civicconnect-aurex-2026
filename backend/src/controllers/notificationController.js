const Notification = require('../models/Notification');

exports.list = async (req, res) => {
  try {
    const items = await Notification.find({ user_id: req.user._id }).sort({ createdAt: -1 }).limit(100).lean();
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed' });
  }
};

exports.markRead = async (req, res) => {
  try {
    const r = await Notification.updateOne({ _id: req.params.id, user_id: req.user._id }, { $set: { read_status: true } });
    if (!r.matchedCount) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, data: { ok: true } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed' });
  }
};
