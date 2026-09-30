// backend/src/server.js

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initDB } from './config/database.js';

import branchRoutes from './routes/branchRoutes.js';
import userRoutes from './routes/userRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const FRONTEND_ORIGINS = ['http://localhost:5173', 'http://localhost:8080'];
const PORT = process.env.PORT || 3000;

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_ORIGINS,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
});

app.set('io', io);

// DB (Neon PostgreSQL)
initDB()
  .then(() => console.log('✅ PostgreSQL connected & initialized'))
  .catch((err) => {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1);
  });

// Security / CORS
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (FRONTEND_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.options('*', cors());

// Parsers, logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());
app.use(morgan('dev'));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);

// Health
app.get('/health', (req, res) =>
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV || 'development',
    time: new Date().toISOString(),
  })
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/users', userRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/orders', orderRoutes);

// 404 fallback
app.all('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Socket
io.on('connection', (socket) => {
  console.log('👤 Socket connected:', socket.id);

  socket.on('join_room', ({ userId, branchId, role }) => {
    if (role === 'customer' && userId) socket.join(`user_${userId}`);
    if (branchId) socket.join(`branch_${branchId}`);
    if (role === 'founder') socket.join('founder');
  });

  socket.on('disconnect', () => {
    console.log('👤 Socket disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log('🌐 CORS allowed origins:', FRONTEND_ORIGINS);
});

export default app;
