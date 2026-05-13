const Event = require('../models/Event');

exports.listEvents = async (req, res) => {
  try {
    const items = await Event.find({ status: 'published' }).sort({ starts_at: 1 }).limit(50).lean();
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed to list events' });
  }
};

exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || event.status !== 'published') return res.status(404).json({ success: false, message: 'Event not found' });

    const regs = event.registrants || [];
    if (event.capacity && regs.length >= event.capacity) {
      return res.status(400).json({ success: false, message: 'Event is at capacity' });
    }
    if (regs.some(r => r.user?.toString() === req.user._id.toString())) {
      return res.status(400).json({ success: false, message: 'Already registered' });
    }

    regs.push({ user: req.user._id, registered_at: new Date() });
    event.registrants = regs;
    await event.save();

    const io = require('../lib/socket').getIO();
    io && io.emit('event:registered', { eventId: event._id, user_id: req.user._id });

    return res.json({ success: true, data: { registered: true, count: regs.length, capacity: event.capacity } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Registration failed' });
  }
};
