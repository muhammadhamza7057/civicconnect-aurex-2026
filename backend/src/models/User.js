const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['resident', 'staff', 'admin', 'super_admin'],
    default: 'resident',
    index: true
  },
  department: { type: Schema.Types.ObjectId, ref: 'Department', default: null, index: true },
  staff_id: { type: String, sparse: true, unique: true, index: true },
  profile_photo: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  two_factor_verified: { type: Boolean, default: false },
  ip_restriction_simulated: { type: Boolean, default: false },
  metadata: { type: Schema.Types.Mixed, default: {} },
  /** @deprecated legacy field — migrated to `name` */
  full_name: { type: String }
}, { timestamps: true });

UserSchema.pre('validate', function(next) {
  if (!this.name && this.full_name) this.name = this.full_name;
  next();
});

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
