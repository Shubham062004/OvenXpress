// backend/src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password').lean();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found for token' });
    }

    req.user = { id: user._id.toString(), role: user.role || 'customer' };
    next();
  } catch (err) {
    console.error('authMiddleware error', err);
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized, token failed' });
  }
});

export const protect = authMiddleware;
