
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' },
    address: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: {
      type: String,
      enum: ['customer', 'staff', 'manager', 'founder'],
      default: 'customer',
    },
    branch: { type: Number, default: null },
    addresses: [addressSchema],
    birthday: { type: Date },
    preferences: {
      type: Object,
      default: {},
    },
    profileImage: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Public profile
userSchema.methods.toPublicJSON = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    branch: this.branch,
    addresses: this.addresses,
    birthday: this.birthday,
    preferences: this.preferences,
    profileImage: this.profileImage,
    isActive: this.isActive,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model('User', userSchema);

export default User;
