const Notification = require('../models/Notification');
const { getIO } = require('./socket');

async function notifyUser(userId, message, type = 'general', metadata = {}) {
  if (!userId) return null;
  const doc = await Notification.create({
    user_id: userId,
    message,
    type,
    read_status: false,
    metadata
  });
  const io = getIO();
  const payload = { user_id: userId.toString(), message, type, id: doc._id };
  io && io.emit('notification:new', payload);
  io && io.emit('notification_created', payload);
  return doc;
}

module.exports = { notifyUser };
