// backend/src/routes/branchRoutes.js
import express from 'express';
import {
  getAllBranches,
  getBranchById,
  getActiveCities,
} from '../controllers/branchController.js';

const router = express.Router();

router.get('/cities', getActiveCities);
router.get('/', getAllBranches);
router.get('/:id', getBranchById);

export default router;
