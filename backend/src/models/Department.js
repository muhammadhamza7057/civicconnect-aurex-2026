const { Schema, model } = require('mongoose');

const DepartmentSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  contact_email: { type: String },
  staff_ids: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  sla_config: {
    type: Schema.Types.Mixed,
    default: () => ({
      response_hours: 24,
      resolution_hours: 72,
      critical_multiplier: 0.25
    })
  },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

DepartmentSchema.index({ name: 1 });

module.exports = model('Department', DepartmentSchema);
