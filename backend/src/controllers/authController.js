// controllers/authController.js
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn('⚠️  WARNING: JWT_SECRET not set. Set process.env.JWT_SECRET for production.');
}

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET || 'dev-secret', {
    expiresIn: '30d',
  });
};

// Use Joi with labels set to 'key' so messages show "name is required" rather than "value"
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().allow('', null).optional(),
}).prefs({ errors: { label: 'key' } });

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
}).prefs({ errors: { label: 'key' } });

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    // Joi error.details[0].message is usually user-friendly
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const { name, email, password, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }

  const user = await User.create({ name, email, password, phone });

  // Make sure your User model implements toPublicJSON
  const publicUser = typeof user.toPublicJSON === 'function' ? user.toPublicJSON() : {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    createdAt: user.createdAt,
  };

  return res.status(201).json({
    success: true,
    data: {
      user: publicUser,
      token: generateToken(user._id),
    },
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  // Ensure your User model has a comparePassword method that returns boolean
  const isMatch = typeof user.comparePassword === 'function' ? await user.comparePassword(password) : user.password === password;
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const publicUser = typeof user.toPublicJSON === 'function' ? user.toPublicJSON() : {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  };

  return res.json({
    success: true,
    data: {
      user: publicUser,
      token: generateToken(user._id),
    },
  });
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const publicUser = typeof user.toPublicJSON === 'function' ? user.toPublicJSON() : {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  };

  return res.json({
    success: true,
    data: publicUser,
  });
});

// PUT /api/auth/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  if (req.body.name !== undefined) user.name = req.body.name;
  if (req.body.phone !== undefined) user.phone = req.body.phone;
  if (req.body.profileImage !== undefined) user.profileImage = req.body.profileImage;
  if (req.body.birthday !== undefined) user.birthday = req.body.birthday;
  if (req.body.preferences !== undefined) user.preferences = req.body.preferences;

  if (Array.isArray(req.body.addresses)) {
    user.addresses = req.body.addresses;
  }

  if (req.body.password) {
    user.password = req.body.password; // pre-save hook should hash
  }

  const saved = await user.save();
  const publicUser = typeof saved.toPublicJSON === 'function' ? saved.toPublicJSON() : {
    id: saved._id,
    name: saved.name,
    email: saved.email,
    phone: saved.phone,
  };

  return res.json({
    success: true,
    data: {
      user: publicUser,
      token: generateToken(saved._1d),
    },
  });
});
