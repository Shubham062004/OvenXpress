// backend/src/controllers/branchController.js
import { query } from '../config/database.js';

/**
 * Get all active branches available for customer ordering
 * GET /api/branches
 */
export const getAllBranches = async (req, res) => {
  try {
    const { city, search } = req.query;
    let sql = `
      SELECT 
        id,
        name,
        code,
        description,
        address,
        city,
        state,
        "postalCode",
        phone,
        email,
        "openingTime",
        "closingTime",
        status
      FROM "Branch"
      WHERE status = 'ACTIVE'
    `;
    const params = [];

    if (city) {
      params.push(city.trim());
      sql += ` AND LOWER(city) = LOWER($${params.length})`;
    }

    if (search) {
      params.push(`%${search.trim().toLowerCase()}%`);
      sql += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(address) LIKE $${params.length} OR LOWER(city) LIKE $${params.length})`;
    }

    sql += ` ORDER BY city, name`;

    const result = await query(sql, params);

    return res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error('getAllBranches error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch branches' });
  }
};

/**
 * Get branch by ID
 * GET /api/branches/:id
 */
export const getBranchById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        id,
        name,
        code,
        description,
        address,
        city,
        state,
        "postalCode",
        phone,
        email,
        "openingTime",
        "closingTime",
        status
      FROM "Branch"
      WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Branch not found' });
    }

    const branch = result.rows[0];

    // Branch active check
    if (branch.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'This branch is currently inactive for ordering',
      });
    }

    return res.json({
      success: true,
      data: branch,
    });
  } catch (err) {
    console.error('getBranchById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch branch' });
  }
};

/**
 * Get distinct active cities
 * GET /api/branches/cities
 */
export const getActiveCities = async (req, res) => {
  try {
    const result = await query(
      `SELECT DISTINCT city 
       FROM "Branch" 
       WHERE status = 'ACTIVE' AND city IS NOT NULL 
       ORDER BY city`
    );

    const cities = result.rows.map((r) => r.city);

    return res.json({
      success: true,
      data: cities,
    });
  } catch (err) {
    console.error('getActiveCities error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch cities' });
  }
};

export default {
  getAllBranches,
  getBranchById,
  getActiveCities,
};
