const { Schema, model } = require('mongoose');

const TicketCommentSchema = new Schema({
  ticket: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  body: { type: String, required: true },
  public: { type: Boolean, default: true },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = model('TicketComment', TicketCommentSchema);
