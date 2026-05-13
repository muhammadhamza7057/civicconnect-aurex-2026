const { Schema, model } = require('mongoose');

const TicketCommentSchema = new Schema({
  ticket_id: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  message: { type: String, required: true },
  visibility: { type: String, enum: ['public', 'internal'], default: 'public', index: true },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

TicketCommentSchema.index({ ticket_id: 1, createdAt: 1 });

module.exports = model('TicketComment', TicketCommentSchema);
