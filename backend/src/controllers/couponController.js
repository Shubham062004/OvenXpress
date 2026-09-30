// backend/src/controllers/couponController.js
import { query } from '../config/database.js';

// GET /api/coupons
export const getActiveCoupons = async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        id,
        code,
        discount,
        "discountType" as type,
        "minOrder" as "minOrderValue",
        "maxDiscount",
        "expiresAt"
       FROM "Coupon"
       WHERE "isActive" = true AND ("expiresAt" IS NULL OR "expiresAt" > NOW())
       ORDER BY "minOrder" ASC`
    );

    return res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getActiveCoupons error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/coupons/validate
// body: { code: string, orderValue: number }
export const validateCoupon = async (req, res) => {
  try {
    const { code, orderValue = 0 } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const result = await query(
      `SELECT 
        id,
        code,
        discount,
        "discountType" as type,
        "minOrder" as "minOrderValue",
        "maxDiscount",
        "expiresAt"
       FROM "Coupon"
       WHERE UPPER(code) = UPPER($1) AND "isActive" = true AND ("expiresAt" IS NULL OR "expiresAt" > NOW())`,
      [code.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    const coupon = result.rows[0];
    const minOrder = parseFloat(coupon.minOrderValue) || 0;
    const orderValNum = parseFloat(orderValue) || 0;

    if (orderValNum < minOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value for this coupon is ₹${minOrder}`,
      });
    }

    let calculatedDiscount = 0;
    const discountVal = parseFloat(coupon.discount) || 0;

    if (coupon.type === 'fixed') {
      calculatedDiscount = discountVal;
    } else {
      // percentage
      calculatedDiscount = Math.round(orderValNum * (discountVal / 100));
      if (coupon.maxDiscount) {
        calculatedDiscount = Math.min(calculatedDiscount, parseFloat(coupon.maxDiscount));
      }
    }

    calculatedDiscount = Math.min(calculatedDiscount, orderValNum);

    return res.json({
      success: true,
      data: {
        coupon: {
          code: coupon.code,
          discount: discountVal,
          type: coupon.type,
          minOrderValue: minOrder,
          maxDiscount: coupon.maxDiscount,
        },
        discount: calculatedDiscount,
      },
    });
  } catch (err) {
    console.error('validateCoupon error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export default {
  getActiveCoupons,
  validateCoupon,
};
