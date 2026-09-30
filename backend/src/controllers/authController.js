// backend/src/controllers/authController.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { createId } from '@paralleldrive/cuid2';
import { query, getClient } from '../config/database.js';

const signToken = (user) => {
  const payload = {
    id: user.id || user._id,
    role: (user.role || 'customer').toLowerCase(),
    email: user.email,
  };
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

    const result = await query(
      `SELECT u.id, u.name, u.email, u."passwordHash", u.phone, u."isActive", u.addresses, r.name as role
       FROM "User" u
       LEFT JOIN "Role" r ON u."roleId" = r.id
       WHERE LOWER(u.email) = LOWER($1)`,
      [email.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken(user);
    const publicUser = {
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      role: (user.role || 'customer').toLowerCase(),
      phone: user.phone || '',
      addresses: user.addresses || [],
    };

    return res.json({ success: true, data: { user: publicUser, token } });
  } catch (err) {
    console.error('loginController error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const registerController = async (req, res) => {
  const client = await getClient();
  try {
    const { name, email, password, phone } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check existing email
    const existing = await client.query('SELECT id FROM "User" WHERE LOWER(email) = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // Get customer role ID
    let roleRes = await client.query('SELECT id FROM "Role" WHERE name = $1', ['CUSTOMER']);
    let customerRoleId;
    if (roleRes.rows.length === 0) {
      customerRoleId = createId();
      await client.query(
        'INSERT INTO "Role" (id, name, description, "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW())',
        [customerRoleId, 'CUSTOMER', 'Customer portal user for OvenXpress customer app']
      );
    } else {
      customerRoleId = roleRes.rows[0].id;
    }

    const userId = createId();
    const customerId = createId();
    const passwordHash = await bcrypt.hash(password, 12);
    const cleanPhone = phone ? phone.trim() : null;

    await client.query('BEGIN');

    // 1. Create User record
    await client.query(
      `INSERT INTO "User" (id, name, email, "passwordHash", "roleId", "isActive", phone, addresses, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, true, $6, '[]'::jsonb, NOW(), NOW())`,
      [userId, name.trim(), normalizedEmail, passwordHash, customerRoleId, cleanPhone]
    );

    // 2. Create matching Customer record (so user is visible in Oven_Xpress operations)
    await client.query(
      `INSERT INTO "Customer" (id, name, phone, email, status, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, 'ACTIVE', NOW(), NOW())
       ON CONFLICT (phone) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name`,
      [customerId, name.trim(), cleanPhone, normalizedEmail]
    );

    await client.query('COMMIT');

    const publicUser = {
      _id: userId,
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      role: 'customer',
      phone: cleanPhone || '',
      addresses: [],
    };

    const token = signToken(publicUser);

    return res.status(201).json({ success: true, data: { user: publicUser, token } });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('registerController error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
};

export const getMeController = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const result = await query(
      `SELECT u.id, u.name, u.email, u.phone, u.addresses, r.name as role
       FROM "User" u
       LEFT JOIN "Role" r ON u."roleId" = r.id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];
    const publicUser = {
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      role: (user.role || 'customer').toLowerCase(),
      phone: user.phone || '',
      addresses: user.addresses || [],
    };

    return res.json({ success: true, data: publicUser });
  } catch (err) {
    console.error('getMeController error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateProfileController = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { name, phone, password } = req.body;

    const updates = [];
    const params = [];

    if (name !== undefined) {
      params.push(name.trim());
      updates.push(`name = $${params.length}`);
    }

    if (phone !== undefined) {
      params.push(phone.trim());
      updates.push(`phone = $${params.length}`);
    }

    if (password && password.trim().length >= 6) {
      const hash = await bcrypt.hash(password.trim(), 12);
      params.push(hash);
      updates.push(`"passwordHash" = $${params.length}`);
      updates.push(`"passwordChangedAt" = NOW()`);
    }

    if (updates.length > 0) {
      updates.push(`"updatedAt" = NOW()`);
      params.push(userId);
      await query(
        `UPDATE "User" SET ${updates.join(', ')} WHERE id = $${params.length}`,
        params
      );
    }

    const result = await query(
      `SELECT u.id, u.name, u.email, u.phone, u.addresses, r.name as role
       FROM "User" u
       LEFT JOIN "Role" r ON u."roleId" = r.id
       WHERE u.id = $1`,
      [userId]
    );

    const user = result.rows[0];
    const publicUser = {
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      role: (user.role || 'customer').toLowerCase(),
      phone: user.phone || '',
      addresses: user.addresses || [],
    };

    return res.json({ success: true, data: publicUser });
  } catch (err) {
    console.error('updateProfileController error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const genericSuccessMessage =
      'If an account with that email exists, password reset instructions have been sent.';

    const userRes = await query('SELECT id FROM "User" WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (userRes.rows.length === 0) {
      return res.json({ success: true, message: genericSuccessMessage });
    }

    const userId = userRes.rows[0].id;
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const tokenId = createId();
    await query(
      `INSERT INTO "PasswordResetToken" (id, "tokenHash", "userId", "expiresAt", "createdAt")
       VALUES ($1, $2, $3, $4, NOW())`,
      [tokenId, tokenHash, userId, expiresAt]
    );

    const responsePayload = {
      success: true,
      message: genericSuccessMessage,
    };

    if (process.env.NODE_ENV !== 'production') {
      responsePayload.devResetToken = resetToken;
    }

    return res.json(responsePayload);
  } catch (err) {
    console.error('forgotPasswordController error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

    const tokenRes = await query(
      `SELECT id, "userId" 
       FROM "PasswordResetToken" 
       WHERE "tokenHash" = $1 AND "expiresAt" > NOW()`,
      [tokenHash]
    );

    if (tokenRes.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired',
      });
    }

    const { id: tokenId, userId } = tokenRes.rows[0];
    const passwordHash = await bcrypt.hash(newPassword, 12);

    await query(
      `UPDATE "User" 
       SET "passwordHash" = $1, "passwordChangedAt" = NOW(), "updatedAt" = NOW() 
       WHERE id = $2`,
      [passwordHash, userId]
    );

    // Delete used reset token
    await query('DELETE FROM "PasswordResetToken" WHERE id = $1', [tokenId]);

    return res.json({
      success: true,
      message: 'Password reset successful. Please log in with your new password.',
    });
  } catch (err) {
    console.error('resetPasswordController error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const logoutController = async (req, res) => {
  return res.json({ success: true, message: 'Logged out' });
};

export default {
  loginController,
  registerController,
  getMeController,
  updateProfileController,
  forgotPasswordController,
  resetPasswordController,
  logoutController,
};
