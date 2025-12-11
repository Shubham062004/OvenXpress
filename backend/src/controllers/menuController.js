import MenuItem from '../models/MenuItem.js';

// GET /api/menu?available=true
export const getMenuItems = async (req, res) => {
  try {
    const filter = {};
    if (req.query.available === 'true') {
      filter.isAvailable = true;
    }

    const items = await MenuItem.find(filter).lean();

    const data = items.map((it) => ({
      _id: it._id.toString(),
      name: it.name,
      price: it.price,
      cost: it.cost,
      category: it.category,
      description: it.description,
      image: it.image,
      imageUrl: it.image,
      ingredients: it.ingredients || [],
      allergens: it.allergens || [],
      nutritionalInfo: it.nutritionInfo || {},
      availability: { isAvailable: it.isAvailable },
      prepTime: it.preparationTime,
      isSpecial: it.tags?.includes('special') || false,
      isPopular: it.tags?.includes('popular') || false,
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching menu items:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch menu items',
    });
  }
};

// GET /api/menu/categories
export const getMenuCategories = async (req, res) => {
  try {
    const categories = await MenuItem.distinct('category', {
      isAvailable: true,
    });

    res.json({ success: true, data: categories });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
    });
  }
};
