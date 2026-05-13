const { Schema, model } = require('mongoose');

const TicketSchema = new Schema({
  ticket_code: { type: String, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  reporter: { type: Schema.Types.ObjectId, ref: 'User' },
  department: { type: Schema.Types.ObjectId, ref: 'Department' },
  ai_category: { type: String, default: null },
  ai_priority: { type: String, default: null },
  ai_summary: { type: String, default: null },
  ai_duplicate_candidates: [{ type: Schema.Types.ObjectId, ref: 'Ticket' }],
  is_emergency: { type: Boolean, default: false },
  priority: { type: String, enum: ['low','medium','high','critical','emergency'], default: 'medium' },
  status: { type: String, enum: ['submitted','under_review','assigned','in_progress','resolved','closed','escalated'], default: 'submitted', index: true },
  assigned_to: { type: Schema.Types.ObjectId, ref: 'User' },
  sla_due_at: { type: Date, index: true },
  is_duplicate: { type: Boolean, default: false },
  duplicate_of: { type: Schema.Types.ObjectId, ref: 'Ticket', default: null },
  attachments: { type: Array, default: [] },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

// text index for search
TicketSchema.index({ title: 'text', description: 'text' });

module.exports = model('Ticket', TicketSchema);
