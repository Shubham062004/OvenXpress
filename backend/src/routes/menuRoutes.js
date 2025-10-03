import express from 'express';
import {
  getMenuItems,
  getMenuItemById,
  getCategories,
  getFeaturedItems
} from '../controllers/menuController.js';

const router = express.Router();

router.get('/', getMenuItems);
router.get('/categories', getCategories);
router.get('/featured', getFeaturedItems);
router.get('/:id', getMenuItemById);

export default router;
