// backend/src/routes/userRoutes.js
import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from '../controllers/userController.js';

const router = express.Router();

// All /api/users/* routes require auth
router.use(authMiddleware);

// Address CRUD
router
  .route('/addresses')
  .get(getAddresses)
  .post(addAddress);

router
  .route('/addresses/:addressId')
  .put(updateAddress)
  .delete(deleteAddress);

export default router;
