// backend/src/models/Coupon.js
import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    type: {
      // 'fixed' | 'percentage'
      type: String,
      enum: ['fixed', 'percentage'],
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    maxDiscount: {
      type: Number,
    },
    active: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
