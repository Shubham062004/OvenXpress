// backend/src/controllers/userController.js
import asyncHandler from 'express-async-handler';
import { createId } from '@paralleldrive/cuid2';
import { query } from '../config/database.js';

// GET /api/users/addresses
// Private - Customer
export const getAddresses = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;

  const result = await query('SELECT addresses FROM "User" WHERE id = $1', [userId]);
  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const addresses = result.rows[0].addresses || [];
  return res.json({ success: true, data: addresses });
});

// POST /api/users/addresses
// Private - Customer
export const addAddress = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const {
    label = 'Home',
    line1 = '',
    line2 = '',
    city = '',
    state = '',
    postalCode,
    pincode,
    phone = '',
    address,
    isDefault = false,
  } = req.body;

  const canonicalPincode = (pincode || postalCode || '').trim();

  const userRes = await query('SELECT addresses FROM "User" WHERE id = $1', [userId]);
  if (userRes.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const computedSingleLine =
    address && address.trim().length > 0
      ? address.trim()
      : [line1, line2, city, state, canonicalPincode].filter(Boolean).join(', ');

  const newAddress = {
    _id: createId(),
    id: createId(),
    label: label.trim(),
    address: computedSingleLine,
    line1: line1.trim(),
    line2: line2.trim(),
    city: city.trim(),
    state: state.trim(),
    pincode: canonicalPincode,
    phone: phone.trim(),
    isDefault: !!isDefault,
  };

  let addresses = userRes.rows[0].addresses || [];

  if (addresses.length === 0 || newAddress.isDefault) {
    addresses = addresses.map((a) => ({ ...a, isDefault: false }));
    newAddress.isDefault = true;
  }

  addresses.push(newAddress);

  await query('UPDATE "User" SET addresses = $1::jsonb, "updatedAt" = NOW() WHERE id = $2', [
    JSON.stringify(addresses),
    userId,
  ]);

  return res.status(201).json({ success: true, data: addresses });
});

// PUT /api/users/addresses/:addressId
// Private - Customer (IDOR protected: only modifies address belonging to authenticated customer)
export const updateAddress = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const { addressId } = req.params;
  const {
    label,
    line1,
    line2,
    city,
    state,
    postalCode,
    pincode,
    phone,
    address,
    isDefault,
  } = req.body;

  const userRes = await query('SELECT addresses FROM "User" WHERE id = $1', [userId]);
  if (userRes.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  let addresses = userRes.rows[0].addresses || [];
  const targetIdx = addresses.findIndex(
    (a) => a._id === addressId || a.id === addressId
  );

  if (targetIdx === -1) {
    return res.status(404).json({ success: false, message: 'Address not found' });
  }

  const targetAddr = addresses[targetIdx];
  const canonicalPincode = pincode !== undefined ? pincode : postalCode;

  if (label !== undefined) targetAddr.label = label.trim();
  if (line1 !== undefined) targetAddr.line1 = line1.trim();
  if (line2 !== undefined) targetAddr.line2 = line2.trim();
  if (city !== undefined) targetAddr.city = city.trim();
  if (state !== undefined) targetAddr.state = state.trim();
  if (canonicalPincode !== undefined) targetAddr.pincode = String(canonicalPincode).trim();
  if (phone !== undefined) targetAddr.phone = phone.trim();

  if (address !== undefined && address.trim().length > 0) {
    targetAddr.address = address.trim();
  } else {
    targetAddr.address = [
      targetAddr.line1,
      targetAddr.line2,
      targetAddr.city,
      targetAddr.state,
      targetAddr.pincode,
    ]
      .filter(Boolean)
      .join(', ');
  }

  if (isDefault) {
    addresses = addresses.map((a) => ({ ...a, isDefault: false }));
    targetAddr.isDefault = true;
  }

  addresses[targetIdx] = targetAddr;

  await query('UPDATE "User" SET addresses = $1::jsonb, "updatedAt" = NOW() WHERE id = $2', [
    JSON.stringify(addresses),
    userId,
  ]);

  return res.json({ success: true, data: addresses });
});

// DELETE /api/users/addresses/:addressId
// Private - Customer (IDOR protected: only deletes address belonging to authenticated customer)
export const deleteAddress = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;
  const { addressId } = req.params;

  const userRes = await query('SELECT addresses FROM "User" WHERE id = $1', [userId]);
  if (userRes.rows.length === 0) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  let addresses = userRes.rows[0].addresses || [];
  const targetIdx = addresses.findIndex(
    (a) => a._id === addressId || a.id === addressId
  );

  if (targetIdx === -1) {
    return res.status(404).json({ success: false, message: 'Address not found' });
  }

  const wasDefault = addresses[targetIdx].isDefault;
  addresses.splice(targetIdx, 1);

  if (wasDefault && addresses.length > 0) {
    addresses[0].isDefault = true;
  }

  await query('UPDATE "User" SET addresses = $1::jsonb, "updatedAt" = NOW() WHERE id = $2', [
    JSON.stringify(addresses),
    userId,
  ]);

  return res.json({
    success: true,
    message: 'Address deleted successfully',
    data: addresses,
  });
});

export default {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
};
