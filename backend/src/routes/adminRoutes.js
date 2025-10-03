import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(admin);

// Admin dashboard routes will be added here
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Admin dashboard' });
});

export default router;
