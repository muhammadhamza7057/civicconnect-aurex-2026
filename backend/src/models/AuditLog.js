const { Schema, model } = require('mongoose');

const AuditLogSchema = new Schema({
  action: { type: String, required: true, index: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  resourceType: { type: String, index: true },
  resourceId: { type: Schema.Types.ObjectId, index: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
  payload: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

AuditLogSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });

AuditLogSchema.pre('validate', function(next) {
  if (!this.metadata || Object.keys(this.metadata).length === 0) {
    this.metadata = { ...(this.payload || {}) };
  }
  next();
});

module.exports = model('AuditLog', AuditLogSchema);
