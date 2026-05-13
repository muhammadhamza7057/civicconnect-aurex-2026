const { Schema, model } = require('mongoose');

const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  payload: { type: Schema.Types.Mixed, required: true },
  read: { type: Boolean, default: false },
  channel: { type: String, default: 'in-app' }
}, { timestamps: true });

module.exports = model('Notification', NotificationSchema);
