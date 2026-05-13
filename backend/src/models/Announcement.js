const { Schema, model } = require('mongoose');

const AnnouncementSchema = new Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  is_public: { type: Boolean, default: true },
  is_emergency: { type: Boolean, default: false, index: true },
  target_roles: [{ type: String }],
  starts_at: { type: Date, default: Date.now },
  ends_at: { type: Date },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = model('Announcement', AnnouncementSchema);
