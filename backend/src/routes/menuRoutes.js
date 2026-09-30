import {
  getMenuItems,
  getMenuItemById,
  getMenuCategories,
} from '../controllers/menuController.js';

const router = express.Router();

// GET /api/menu
router.get('/', getMenuItems);

// GET /api/menu/categories
router.get('/categories', getMenuCategories);

// GET /api/menu/:id
router.get('/:id', getMenuItemById);

export default router;
