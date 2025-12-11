// backend/src/routes/userRoutes.js
import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getAddresses,
  addAddress,
} from '../controllers/userController.js';

const router = express.Router();

// All /api/users/* routes require auth
router.use(authMiddleware);

// GET /api/users/addresses
// POST /api/users/addresses
router
  .route('/addresses')
  .get(getAddresses)
  .post(addAddress);

export default router;
