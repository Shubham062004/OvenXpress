// backend/src/routes/authRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  loginController,
  registerController,
  getMeController,
  updateProfileController,
  forgotPasswordController,
  resetPasswordController,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginController);
router.post('/register', registerController);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);
router.get('/me', protect, getMeController);
router.put('/profile', protect, updateProfileController);

export default router;
