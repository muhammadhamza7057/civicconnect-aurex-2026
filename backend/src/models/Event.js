const { Schema, model } = require('mongoose');

const EventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  organizer: { type: Schema.Types.ObjectId, ref: 'User' },
  capacity: { type: Number, default: 0 },
  status: { type: String, enum: ['draft','published','cancelled','expired'], default: 'draft' },
  starts_at: { type: Date },
  ends_at: { type: Date },
  location: { type: Schema.Types.Mixed },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = model('Event', EventSchema);
