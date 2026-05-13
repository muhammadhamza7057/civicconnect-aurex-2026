const { Schema, model } = require('mongoose');

const NotificationSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  message: { type: String, required: true },
  type: { type: String, default: 'general', index: true },
  read_status: { type: Boolean, default: false, index: true },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

NotificationSchema.index({ user_id: 1, read_status: 1, createdAt: -1 });

module.exports = model('Notification', NotificationSchema);
