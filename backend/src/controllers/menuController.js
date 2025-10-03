import asyncHandler from 'express-async-handler';
import MenuItem from '../models/MenuItem.js';

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
export const getMenuItems = asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 20 } = req.query;
  
  let query = { isAvailable: true };
  
  if (category && category !== 'all') {
    query.category = category;
  }
  
  if (search) {
    query.$text = { $search: search };
  }
  
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 }
  };
  
  const menuItems = await MenuItem.find(query)
    .skip((options.page - 1) * options.limit)
    .limit(options.limit)
    .sort(options.sort);
    
  const total = await MenuItem.countDocuments(query);
  
  res.json({
    menuItems,
    pagination: {
      current: options.page,
      pages: Math.ceil(total / options.limit),
      total
    }
  });
});

// @desc    Get menu item by ID
// @route   GET /api/menu/:id
// @access  Public
export const getMenuItemById = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id);
  
  if (menuItem) {
    res.json(menuItem);
  } else {
    res.status(404).json({ message: 'Menu item not found' });
  }
});

// @desc    Get menu categories
// @route   GET /api/menu/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await MenuItem.distinct('category');
  res.json(categories);
});

// @desc    Get featured items
// @route   GET /api/menu/featured
// @access  Public
export const getFeaturedItems = asyncHandler(async (req, res) => {
  const featuredItems = await MenuItem.find({ 
    isAvailable: true,
    'rating.average': { $gte: 4.0 }
  }).limit(6).sort({ 'rating.average': -1 });
  
  res.json(featuredItems);
});
