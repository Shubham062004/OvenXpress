// backend/src/controllers/userController.js
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// GET /api/users/addresses
// Private
export const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('addresses').lean();

  if (!user) {
    return res
      .status(404)
      .json({ success: false, message: 'User not found' });
  }

  return res.json({ success: true, data: user.addresses || [] });
});

// POST /api/users/addresses
// Private
export const addAddress = asyncHandler(async (req, res) => {
  const {
    label,
    line1,
    line2,
    city,
    state,
    postalCode,
    phone,
    isDefault,
  } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return res
      .status(404)
      .json({ success: false, message: 'User not found' });
  }

  const newAddress = {
    label,
    line1,
    line2,
    city,
    state,
    postalCode,
    phone,
    isDefault: !!isDefault,
  };

  if (!user.addresses) user.addresses = [];
  if (newAddress.isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  user.addresses.push(newAddress);
  await user.save();

  return res
    .status(201)
    .json({ success: true, data: user.addresses });
});
