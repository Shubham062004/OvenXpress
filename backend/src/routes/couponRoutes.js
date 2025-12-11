// backend/src/routes/couponRoutes.js

import express from 'express';
import {
  getActiveCoupons,
  validateCoupon,
  createCoupon,
} from '../controllers/couponController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: list active coupons
router.get('/', getActiveCoupons);

// Public: validate coupon used at checkout
router.post('/validate', validateCoupon);

// Optional admin route, protect if needed
router.post('/', authMiddleware, createCoupon);

export default router;
