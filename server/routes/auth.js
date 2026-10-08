const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Email validation helper
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, phone and password are required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone.trim();

    const existingUser = await db.query('SELECT id FROM users WHERE email = $1 OR phone = $2', [cleanEmail, cleanPhone]);
    if (existingUser.rowCount > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email or phone number already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await db.query(
      `INSERT INTO users (name, email, phone, password_hash, role, status)
       VALUES ($1, $2, $3, $4, 'customer', 'active')
       RETURNING id, name, email, phone, role, status, created_at`,
      [name.trim(), cleanEmail, cleanPhone, passwordHash]
    );

    const user = newUser.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create account. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const identifier = req.body.identifier || req.body.email || req.body.phone;
    const password = req.body.password;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Email/Phone and password are required.' });
    }

    const cleanIdentifier = String(identifier).trim().toLowerCase();
    const userRes = await db.query(
      `SELECT * FROM users WHERE LOWER(email) = $1 OR phone = $2`,
      [cleanIdentifier, String(identifier).trim()]
    );

    if (userRes.rowCount === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email/phone or password.' });
    }

    const user = userRes.rows[0];

    if (user.status === 'disabled') {
      return res.status(403).json({ success: false, message: 'This account has been disabled. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email/phone or password.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status
    };

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Login failed due to a server error.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// PUT /api/auth/profile (Update name, phone)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name && !phone) {
      return res.status(400).json({ success: false, message: 'Nothing to update.' });
    }

    const updated = await db.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, name, email, phone, role, status`,
      [name ? name.trim() : null, phone ? phone.trim() : null, req.user.id]
    );

    res.json({ success: true, message: 'Profile updated successfully.', user: updated.rows[0] });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const oldPassword = req.body.oldPassword || req.body.currentPassword;
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const userRes = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const isMatch = await bcrypt.compare(oldPassword, userRes.rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newHash, req.user.id]);

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
});

// GET /api/auth/addresses
router.get('/addresses', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, id DESC', [req.user.id]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch addresses error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch addresses.' });
  }
});

// POST /api/auth/addresses
router.post('/addresses', authenticateToken, async (req, res) => {
  try {
    const full_name = req.body.full_name || req.body.fullName;
    const phone = req.body.phone;
    const address_line1 = req.body.address_line1 || req.body.addressLine1;
    const address_line2 = req.body.address_line2 || req.body.addressLine2;
    const area = req.body.area || req.body.addressLine2 || req.body.city || 'Central';
    const city = req.body.city;
    const state = req.body.state;
    const pincode = req.body.pincode;
    const landmark = req.body.landmark;
    const is_default = req.body.is_default !== undefined ? req.body.is_default : req.body.isDefault;

    if (!full_name || !phone || !address_line1 || !city || !state || !pincode) {
      return res.status(400).json({ success: false, message: 'All required address fields must be filled.' });
    }

    if (is_default) {
      await db.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [req.user.id]);
    }

    const inserted = await db.query(
      `INSERT INTO addresses (user_id, full_name, phone, address_line1, address_line2, area, city, state, pincode, landmark, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [req.user.id, full_name.trim(), phone.trim(), address_line1.trim(), address_line2 || null, area.trim(), city.trim(), state.trim(), pincode.trim(), landmark || null, !!is_default]
    );

    res.status(201).json({ success: true, message: 'Address saved successfully.', data: inserted.rows[0] });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ success: false, message: 'Failed to save address.' });
  }
});

// DELETE /api/auth/addresses/:id
router.delete('/addresses/:id', authenticateToken, async (req, res) => {
  try {
    await db.query('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Address deleted.' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete address.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

module.exports = router;
