// backend/src/config/database.js
import pg from 'pg';
import dotenv from 'dotenv';
import { createId } from '@paralleldrive/cuid2';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL is not defined in environment variables');
  process.exit(1);
}

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('⚠️ Unexpected idle PostgreSQL client error:', err.message);
});

export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development' && duration > 500) {
      console.warn(`🐢 Slow query (${duration}ms):`, text.substring(0, 100));
    }
    return res;
  } catch (error) {
    console.error('❌ Database query error:', {
      message: error.message,
      query: text.substring(0, 150),
    });
    throw error;
  }
};

export const getClient = async () => {
  const client = await pool.connect();
  return client;
};

// Initialize DB and ensure customer role exists
export const initDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected successfully to Neon DB');

    // Ensure CUSTOMER role exists
    const roleRes = await client.query('SELECT id FROM "Role" WHERE name = $1', ['CUSTOMER']);
    let customerRoleId;
    if (roleRes.rows.length === 0) {
      customerRoleId = createId();
      await client.query(
        'INSERT INTO "Role" (id, name, description, "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW())',
        [customerRoleId, 'CUSTOMER', 'Customer portal user for OvenXpress customer app']
      );
      console.log('👑 Created CUSTOMER role in Role table');
    } else {
      customerRoleId = roleRes.rows[0].id;
    }

    // Ensure customer addresses jsonb column exists on User
    await client.query(`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS addresses JSONB DEFAULT '[]'::jsonb;
    `);

    // Ensure Coupon table exists for customer discount codes
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Coupon" (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        discount NUMERIC NOT NULL,
        "discountType" TEXT NOT NULL DEFAULT 'percentage',
        "minOrder" NUMERIC NOT NULL DEFAULT 0,
        "maxDiscount" NUMERIC,
        "expiresAt" TIMESTAMP,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Seed default coupons if none exist
    const couponCount = await client.query('SELECT COUNT(*) as count FROM "Coupon"');
    if (parseInt(couponCount.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO "Coupon" (id, code, discount, "discountType", "minOrder", "maxDiscount", "isActive") VALUES
        ($1, 'WELCOME50', 50, 'percentage', 199, 100, true),
        ($2, 'OVEN10', 10, 'percentage', 299, 150, true),
        ($3, 'FLAT100', 100, 'fixed', 399, 100, true)
        ON CONFLICT (code) DO NOTHING;
      `, [createId(), createId(), createId()]);
    }

    client.release();
    return { customerRoleId };
  } catch (err) {
    console.error('❌ Failed to connect or initialize PostgreSQL:', err.message);
    throw err;
  }
};

export default initDB;
