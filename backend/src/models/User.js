import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

/**
 * Address schema
 * - Keeps label + address fields from old version, and also adds structured fields.
 * - You may use either `address` (old single string) or `line1/line2/city/state/pincode`.
 */
const addressSchema = new Schema(
  {
    label: { type: String, default: 'Home', trim: true },

    // Backwards-compatible single-line address (older format)
    address: { type: String, default: '' },

    // Structured address fields (recommended)
    line1: { type: String, default: '' },
    line2: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },

    // contact phone for this address (optional)
    phone: { type: String, default: '' },

    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

/**
 * User schema
 */
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },

    // make email lowercase + indexed for lookups
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },

    password: { type: String, required: true },

    phone: { type: String, trim: true, default: '' },

    role: {
      type: String,
      enum: ['customer', 'staff', 'manager', 'founder', 'admin'],
      default: 'customer',
    },

    // optional branch number for staff
    branch: { type: Number, default: null },

    // Addresses array
    addresses: { type: [addressSchema], default: [] },

    // Optional profile fields
    birthday: { type: Date },
    preferences: { type: Schema.Types.Mixed, default: {} },
    profileImage: { type: String, default: '' },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/**
 * Password hashing middleware
 * - Only hash when password is new/modified
 */
userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

/**
 * Compare a candidate password with the stored hash
 */
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * toPublicJSON
 * - Return safe public profile object (omit password)
 * - Also include a fallback `address` value for backwards compatibility:
 *    - If `addresses[i].address` exists use that
 *    - Otherwise fallback to `line1` + `line2`
 */
userSchema.methods.toPublicJSON = function () {
  const publicObj = {
    _id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    branch: this.branch,
    birthday: this.birthday,
    preferences: this.preferences,
    profileImage: this.profileImage,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };

  // Map addresses with compatibility layer
  publicObj.addresses = (this.addresses || []).map((a) => {
    // If old single-line `address` exists, prefer it
    const singleLine = a.address && a.address.trim().length ? a.address : undefined;
    const structured = (a.line1 || a.line2 || a.city || a.state || a.pincode)
      ? {
          line1: a.line1 || '',
          line2: a.line2 || '',
          city: a.city || '',
          state: a.state || '',
          pincode: a.pincode || '',
        }
      : undefined;

    return {
      _id: a._id,
      label: a.label || 'Home',
      // keep `address` for old clients — prefer singleLine, else join structured lines
      address:
        singleLine ??
        (structured
          ? [structured.line1, structured.line2, structured.city, structured.state, structured.pincode]
              .filter(Boolean)
              .join(', ')
          : ''),
      line1: a.line1 || '',
      line2: a.line2 || '',
      city: a.city || '',
      state: a.state || '',
      pincode: a.pincode || '',
      phone: a.phone || '',
      isDefault: !!a.isDefault,
    };
  });

  return publicObj;
};

// Avoid model overwrite issues with hot reloaders
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
