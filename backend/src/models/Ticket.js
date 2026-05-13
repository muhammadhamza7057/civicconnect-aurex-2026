const { Schema, model } = require('mongoose');

const LocationSchema = new Schema({
  lat: { type: Number },
  lng: { type: Number },
  text: { type: String, default: '' }
}, { _id: false });

const TicketSchema = new Schema({
  ticket_code: { type: String, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  reporter: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  department: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
  location: { type: LocationSchema, default: () => ({}) },
  ai_category: { type: String, default: null },
  ai_priority: { type: String, default: null },
  ai_summary: { type: String, default: null },
  ai_duplicate_candidates: [{ type: Schema.Types.ObjectId, ref: 'Ticket' }],
  is_emergency: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical', 'emergency'], default: 'medium', index: true },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'closed', 'escalated'],
    default: 'submitted',
    index: true
  },
  assigned_to: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  sla_due_at: { type: Date, index: true },
  is_duplicate: { type: Boolean, default: false },
  duplicate_of: { type: Schema.Types.ObjectId, ref: 'Ticket', default: null },
  attachments: { type: Array, default: [] },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

TicketSchema.index({ title: 'text', description: 'text' });
TicketSchema.index({ department: 1, status: 1 });
TicketSchema.index({ reporter: 1, createdAt: -1 });

TicketSchema.virtual('ticket_id').get(function() {
  return this.ticket_code;
});

TicketSchema.virtual('created_by').get(function() {
  return this.reporter;
});

TicketSchema.virtual('department_id').get(function() {
  return this.department;
});

TicketSchema.set('toJSON', { virtuals: true });
TicketSchema.set('toObject', { virtuals: true });

module.exports = model('Ticket', TicketSchema);
