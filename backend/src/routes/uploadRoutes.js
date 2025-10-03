import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All upload routes require authentication
router.use(protect);

// File upload routes will be added here
router.post('/image', (req, res) => {
  res.json({ message: 'Image upload endpoint' });
});

export default router;
