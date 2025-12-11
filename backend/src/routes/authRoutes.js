// backend/src/routes/authRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  loginController,
  registerController,
  getMeController,
  updateProfileController,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginController);
router.post('/register', registerController);
router.get('/me', protect, getMeController);
router.put('/profile', protect, updateProfileController);

export default router;
