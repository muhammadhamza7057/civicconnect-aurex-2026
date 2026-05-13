const { Schema, model } = require('mongoose');

const AuditLogSchema = new Schema({
  resourceType: { type: String, required: true },
  resourceId: { type: Schema.Types.ObjectId, required: true },
  action: { type: String, required: true },
  actor: { type: Schema.Types.ObjectId, ref: 'User' },
  payload: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = model('AuditLog', AuditLogSchema);
