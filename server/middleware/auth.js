const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'techfix_super_secure_jwt_secret_token_key_2026';

const authenticateToken = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userRes = await db.query('SELECT id, name, email, phone, role, status FROM users WHERE id = $1', [decoded.id]);
    
    if (userRes.rowCount === 0 || userRes.rows[0].status === 'disabled') {
      return res.status(403).json({ success: false, message: 'Account is invalid or disabled.' });
    }

    req.user = userRes.rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userRes = await db.query('SELECT id, name, email, phone, role, status FROM users WHERE id = $1', [decoded.id]);
      if (userRes.rowCount > 0 && userRes.rows[0].status !== 'disabled') {
        req.user = userRes.rows[0];
      }
    }
    next();
  } catch (err) {
    // continue without req.user
    next();
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied: Admin privileges required.' });
  }
  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  JWT_SECRET
};
