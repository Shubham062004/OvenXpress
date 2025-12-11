const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/database');
const Coupon = require('../models/Coupon');

dotenv.config();

const coupons = [
  {
    code: 'SAVE50',
    description: 'Flat 50 off on orders above 500',
    discountType: 'FLAT',
    discountValue: 50,
    minOrderValue: 500,
    maxDiscount: 50,
    isActive: true,
  },
  {
    code: 'NEW10',
    description: '10% off for new users',
    discountType: 'PERCENT',
    discountValue: 10,
    minOrderValue: 300,
    maxDiscount: 200,
    isActive: true,
  },
];

const seed = async () => {
  try {
    await connectDB();
    await Coupon.deleteMany({});
    await Coupon.insertMany(coupons);
    console.log('Coupons seeded');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
