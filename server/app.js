const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const builderRoutes = require('./routes/builder');
const repairRoutes = require('./routes/repairs');
const supportRoutes = require('./routes/support');
const adminRoutes = require('./routes/admin');
const chatRoutes = require('./routes/chat');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static Files
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/builder', builderRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

// Comprehensive Health Check
app.get(['/health', '/api/health'], async (req, res) => {
  try {
    const dbRes = await db.query('SELECT 1 AS alive');
    const isDbAlive = dbRes && dbRes.rows && dbRes.rows[0].alive === 1;
    res.json({
      success: true,
      status: isDbAlive ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: isDbAlive ? 'connected' : 'disconnected',
        environment: process.env.NODE_ENV || 'production'
      }
    });
  } catch (err) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
});

// Global Store Config endpoint
app.get('/api/config', (req, res) => {
  res.json({
    success: true,
    data: {
      brandName: 'TechFix',
      tagline: 'Buy. Build. Repair. Delivered.',
      serviceCity: process.env.SERVICE_CITY || 'Mumbai',
      serviceState: process.env.SERVICE_STATE || 'Maharashtra',
      storePhone: process.env.STORE_PHONE || '+91 98765 43210',
      storeEmail: process.env.STORE_EMAIL || 'support@techfix.demo',
      storeAddress: process.env.STORE_ADDRESS || 'Shop 4, Tech Plaza, Lamington Road, Mumbai - 400007',
      maxCodLimit: parseFloat(process.env.MAX_COD_LIMIT || 150000),
      defaultDeliveryCharge: parseFloat(process.env.DEFAULT_DELIVERY_CHARGE || 99),
      freeDeliveryThreshold: parseFloat(process.env.FREE_DELIVERY_THRESHOLD || 999)
    }
  });
});

// Notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let token = req.cookies.token;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    if (!token) return res.json({ success: true, data: [] });

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'techfix_super_secure_jwt_secret_token_key_2026');
    const result = await db.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10', [decoded.id]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.json({ success: true, data: [] });
  }
});

// Fallback 404 for unhandled API endpoints
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Express Server Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 TECHFIX Full-Stack Server Running on http://localhost:${PORT}`);
  console.log(`📦 Primary Database: PostgreSQL (${process.env.DB_NAME || 'techfix_db'})`);
  console.log(`⚡ "Buy. Build. Repair. Delivered."`);
  console.log(`====================================================`);
});

module.exports = app;
