import express from 'express';
import {
  getMenuItems,
  getMenuCategories,
} from '../controllers/menuController.js';

const router = express.Router();

// GET /api/menu
router.get('/', getMenuItems);

// GET /api/menu/categories
router.get('/categories', getMenuCategories);

export default router;
