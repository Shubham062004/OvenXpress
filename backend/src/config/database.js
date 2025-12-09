
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      console.error('❌ MONGODB_URI is not defined in environment variables');
      process.exit(1);
    }

    const conn = await mongoose.connect(uri);
    console.log(`📊 MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;
