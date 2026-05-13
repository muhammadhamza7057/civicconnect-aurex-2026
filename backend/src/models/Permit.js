const { Schema, model } = require('mongoose');

const PermitSchema = new Schema({
  permit_type: { type: String, required: true },
  applicant: { type: Schema.Types.ObjectId, ref: 'User' },
  department: { type: Schema.Types.ObjectId, ref: 'Department' },
  data: { type: Schema.Types.Mixed, default: {} },
  status: { type: String, enum: ['draft','submitted','verification','inspection','approved','rejected'], default: 'draft' },
  draft: { type: Boolean, default: true },
  attachments: { type: Array, default: [] }
}, { timestamps: true });

module.exports = model('Permit', PermitSchema);
