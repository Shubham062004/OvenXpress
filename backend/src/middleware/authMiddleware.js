// backend/src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { query } from '../config/database.js';

export const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    const result = await query(
      `SELECT u.id, u.name, u.email, u.phone, u."isActive", u.addresses, r.name as role
       FROM "User" u
       LEFT JOIN "Role" r ON u."roleId" = r.id
       WHERE u.id = $1`,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found for token' });
    }

    const user = result.rows[0];

    if (!user.isActive) {
      return res
        .status(403)
        .json({ success: false, message: 'Account is deactivated' });
    }

    req.user = {
      id: user.id,
      _id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: (user.role || 'customer').toLowerCase(),
      addresses: user.addresses || [],
    };

    next();
  } catch (err) {
    console.error('authMiddleware error:', err.message);
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized, token failed' });
  }
});

export const protect = authMiddleware;
export default authMiddleware;
