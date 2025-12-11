// backend/src/controllers/authController.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const signToken = (user) => {
  const payload = { id: user._id, role: user.role, email: user.email };
  return jwt.sign(payload, process.env.JWT_SECRET || 'devsecret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // If your model stores hashed password and compare method exists, use it:
    let isMatch = false;
    if (typeof user.comparePassword === 'function') {
      isMatch = await user.comparePassword(password);
    } else {
      // fallback to bcrypt compare if comparePassword not defined
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken(user);
    const publicUser = user.toPublicJSON ? user.toPublicJSON() : {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return res.json({ success: true, data: { user: publicUser, token } });
  } catch (err) {
    console.error('loginController error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      phone,
    });

    await user.save();

    const token = signToken(user);
    const publicUser = user.toPublicJSON ? user.toPublicJSON() : {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return res.status(201).json({ success: true, data: { user: publicUser, token } });
  } catch (err) {
    console.error('registerController error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getMeController = async (req, res) => {
  try {
    // auth middleware should attach req.user (lean object or mongoose doc)
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    // If req.user is a mongoose doc, use toPublicJSON if available
    const publicUser = req.user.toPublicJSON ? req.user.toPublicJSON() : req.user;
    return res.json({ success: true, data: publicUser });
  } catch (err) {
    console.error('getMeController error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateProfileController = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const updates = {};
    const allowed = ['name', 'phone', 'profileImage', 'preferences'];

    allowed.forEach((k) => {
      if (k in req.body) updates[k] = req.body[k];
    });

    // If password update requested
    if (req.body.password) {
      updates.password = req.body.password;
    }

    const updated = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    const publicUser = updated && updated.toPublicJSON ? updated.toPublicJSON() : updated;
    return res.json({ success: true, data: publicUser });
  } catch (err) {
    console.error('updateProfileController error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const logoutController = async (req, res) => {
  // If you use cookies you can clear cookie here. For stateless JWT simply respond ok.
  return res.json({ success: true, message: 'Logged out' });
};

export default {
  loginController,
  registerController,
  getMeController,
  updateProfileController,
  logoutController,
};
