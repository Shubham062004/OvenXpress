// backend/src/controllers/couponController.js

import Coupon from '../models/Coupon.js';

// GET /api/coupons
export const getActiveCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ active: true }).lean();
    res.json({ success: true, data: coupons });
  } catch (err) {
    console.error('getActiveCoupons error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/coupons/validate
// body: { code: string, orderValue: number }
export const validateCoupon = async (req, res) => {
  try {
    const { code, orderValue = 0 } = req.body;

    if (!code) {
      return res
        .status(400)
        .json({ success: false, message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      active: true,
    }).lean();

    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: 'Coupon not found' });
    }

    if (orderValue < (coupon.minOrderValue || 0)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value for this coupon is ₹${coupon.minOrderValue}`,
      });
    }

    let discount = 0;

    if (coupon.type === 'fixed') {
      discount = coupon.value;
    } else if (coupon.type === 'percentage') {
      discount = Math.round(orderValue * (coupon.value / 100));
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    }

    return res.json({
      success: true,
      data: {
        coupon,
        discount,
      },
    });
  } catch (err) {
    console.error('validateCoupon error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Optional admin route
export const createCoupon = async (req, res) => {
  try {
    const data = req.body;
    const coupon = await Coupon.create(data);
    res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    console.error('createCoupon error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
