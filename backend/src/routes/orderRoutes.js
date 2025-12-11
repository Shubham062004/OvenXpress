// backend/src/routes/orderRoutes.js
import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  createOrder,
  getMyOrders,
  getOrderById,
} from '../controllers/orderController.js';

const router = express.Router();

// protect all order routes
router.use(authMiddleware);

// POST /api/orders
router.post('/', createOrder);

// GET /api/orders/my-orders
router.get('/my-orders', getMyOrders);

// GET /api/orders/:id
router.get('/:id', getOrderById);

export default router;
