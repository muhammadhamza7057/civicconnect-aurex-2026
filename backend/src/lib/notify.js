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
  io && io.emit('notification:new', { user_id: userId.toString(), message, type, id: doc._id });
  return doc;
}

module.exports = { notifyUser };
