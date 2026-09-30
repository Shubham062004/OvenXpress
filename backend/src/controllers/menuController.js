// backend/src/controllers/menuController.js
import { query } from '../config/database.js';

/**
 * Format a database row into a customer-safe MenuItem object.
 * Strictly avoids exposing internal cost, recipe quantities, margins, or supplier details.
 */
const formatMenuItem = (row) => ({
  _id: row.id,
  id: row.id,
  name: row.name,
  price: parseFloat(row.price) || 0,
  category: row.category || 'Other',
  categoryId: row.category_id,
  description: row.description || '',
  image: row.image_url || '/placeholder.svg',
  imageUrl: row.image_url || '/placeholder.svg',
  prepTime: row.prep_time || 20,
  isAvailable: row.is_available !== false,
  isSpecial: false,
  isPopular: false,
});

/**
 * GET /api/menu?branchId=...&category=...&search=...&available=true
 * Branch-aware customer menu browsing
 */
export const getMenuItems = async (req, res) => {
  try {
    const { branchId, category, search, available } = req.query;

    let sql;
    const params = [];

    if (branchId) {
      // Branch-aware query: respect branch overrides and availability
      sql = `
        SELECT 
          m.id,
          m.name,
          COALESCE(bmi.price, m.price) as price,
          m.description,
          c.id as category_id,
          c.name as category,
          m."imageUrl" as image_url,
          m."preparationTimeMinutes" as prep_time,
          COALESCE(bmi."isAvailable", true) as is_available
        FROM "MenuItem" m
        LEFT JOIN "MenuCategory" c ON m."categoryId" = c.id
        LEFT JOIN "BranchMenuItem" bmi ON bmi."menuItemId" = m.id AND bmi."branchId" = $1
        WHERE m.status = 'ACTIVE'
      `;
      params.push(branchId);
    } else {
      // Global menu query
      sql = `
        SELECT 
          m.id,
          m.name,
          m.price,
          m.description,
          c.id as category_id,
          c.name as category,
          m."imageUrl" as image_url,
          m."preparationTimeMinutes" as prep_time,
          true as is_available
        FROM "MenuItem" m
        LEFT JOIN "MenuCategory" c ON m."categoryId" = c.id
        WHERE m.status = 'ACTIVE'
      `;
    }

    if (available === 'true' && branchId) {
      sql += ` AND COALESCE(bmi."isAvailable", true) = true`;
    }

    if (category && category.toLowerCase() !== 'all') {
      params.push(category.trim());
      sql += ` AND LOWER(c.name) = LOWER($${params.length})`;
    }

    if (search) {
      params.push(`%${search.trim().toLowerCase()}%`);
      sql += ` AND (LOWER(m.name) LIKE $${params.length} OR LOWER(COALESCE(m.description, '')) LIKE $${params.length})`;
    }

    sql += ` ORDER BY c."sortOrder" ASC NULLS LAST, m.name ASC`;

    const result = await query(sql, params);
    const data = result.rows.map(formatMenuItem);

    return res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('Error fetching menu items:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch menu items',
    });
  }
};

/**
 * GET /api/menu/:id?branchId=...
 */
export const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const { branchId } = req.query;

    let sql;
    let params;

    if (branchId) {
      sql = `
        SELECT 
          m.id,
          m.name,
          COALESCE(bmi.price, m.price) as price,
          m.description,
          c.id as category_id,
          c.name as category,
          m."imageUrl" as image_url,
          m."preparationTimeMinutes" as prep_time,
          COALESCE(bmi."isAvailable", true) as is_available
        FROM "MenuItem" m
        LEFT JOIN "MenuCategory" c ON m."categoryId" = c.id
        LEFT JOIN "BranchMenuItem" bmi ON bmi."menuItemId" = m.id AND bmi."branchId" = $2
        WHERE m.id = $1
      `;
      params = [id, branchId];
    } else {
      sql = `
        SELECT 
          m.id,
          m.name,
          m.price,
          m.description,
          c.id as category_id,
          c.name as category,
          m."imageUrl" as image_url,
          m."preparationTimeMinutes" as prep_time,
          true as is_available
        FROM "MenuItem" m
        LEFT JOIN "MenuCategory" c ON m."categoryId" = c.id
        WHERE m.id = $1
      `;
      params = [id];
    }

    const result = await query(sql, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    return res.json({ success: true, data: formatMenuItem(result.rows[0]) });
  } catch (err) {
    console.error('Error fetching menu item by id:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch menu item',
    });
  }
};

/**
 * GET /api/menu/categories
 */
export const getMenuCategories = async (req, res) => {
  try {
    const result = await query(`
      SELECT DISTINCT c.name 
      FROM "MenuCategory" c
      JOIN "MenuItem" m ON m."categoryId" = c.id
      WHERE c.status = 'ACTIVE' AND m.status = 'ACTIVE'
      ORDER BY c.name
    `);

    const categories = result.rows.map((r) => r.name);
    return res.json({ success: true, data: categories });
  } catch (err) {
    console.error('Error fetching categories:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
    });
  }
};

export default {
  getMenuItems,
  getMenuItemById,
  getMenuCategories,
};
