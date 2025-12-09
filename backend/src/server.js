// server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

// Basic env checks
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Attach io to app so controllers can use it later
app.set('io', io);

// Connect DB
connectDB();

// Security & middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// CORS - for local dev you can set origin to true or CLIENT_URL
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

// Rate limiter for /api
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Body parsers
// Place parsers BEFORE routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Optional debug logger - only in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`\n[DEV] ${req.method} ${req.path}`);
    console.log('content-type:', req.headers['content-type']);
    console.log('body:', req.body);
    next();
  });
}

app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV || 'development',
    time: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);

// 404 for API
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// JSON parse error handler (malformed JSON)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: 'Malformed JSON in request body' });
  }
  next(err);
});

// Basic Socket.io (you can extend later)
io.on('connection', (socket) => {
  console.log('👤 Socket connected:', socket.id);

  socket.on('join_room', ({ userId, branchId, role }) => {
    if (role === 'customer' && userId) {
      socket.join(`user_${userId}`);
    }
    if (branchId) {
      socket.join(`branch_${branchId}`);
    }
    if (role === 'founder') {
      socket.join('founder');
    }
    console.log('🏠 Rooms for socket:', socket.id, [...socket.rooms]);
  });

  socket.on('disconnect', () => {
    console.log('👤 Socket disconnected:', socket.id);
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ success: false, message });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`🌐 CORS allowed origin: ${CLIENT_URL}`);
});

export default app;
