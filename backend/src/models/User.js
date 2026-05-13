const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['resident','staff','department_admin','super_admin'], default: 'resident' },
  department: { type: Schema.Types.ObjectId, ref: 'Department', default: null },
  isActive: { type: Boolean, default: true },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = model('User', UserSchema);
