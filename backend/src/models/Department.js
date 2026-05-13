const { Schema, model } = require('mongoose');

const DepartmentSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  contact_email: { type: String },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = model('Department', DepartmentSchema);
