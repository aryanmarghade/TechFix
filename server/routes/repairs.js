const express = require('express');
const db = require('../db');
const { optionalAuth, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/repairs (BOOK REPAIR WITH PICKUP)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      customer_email,
      device_type,
      brand,
      model,
      problem_category,
      problem_description,
      pickup_date,
      pickup_time,
      address_line,
      city,
      pincode
    } = req.body;

    if (!customer_name || !customer_phone || !customer_email || !device_type || !brand || !model || !problem_category || !problem_description || !pickup_date || !pickup_time || !address_line || !city || !pincode) {
      return res.status(400).json({ success: false, message: 'All booking fields and pickup address details are required.' });
    }

    // Verify service area
    const areaCheck = await db.query('SELECT * FROM service_areas WHERE pincode = $1 AND active = true', [pincode.trim()]);
    if (areaCheck.rowCount === 0) {
      return res.status(400).json({
        success: false,
        message: `Doorstep pickup is currently restricted to Mumbai & Thane service zones (Pincode: ${pincode}). Please submit a support ticket for courier pickup options.`
      });
    }

    const requestNumber = `TF-REP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const userId = req.user ? req.user.id : null;

    const inserted = await db.query(
      `INSERT INTO repair_requests (
        user_id, request_number, customer_name, customer_phone, customer_email,
        device_type, brand, model, problem_category, problem_description,
        pickup_date, pickup_time, address_line, city, pincode, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'Request Received')
      RETURNING *`,
      [
        userId, requestNumber, customer_name.trim(), customer_phone.trim(),
        customer_email.toLowerCase().trim(), device_type.trim(), brand.trim(),
        model.trim(), problem_category.trim(), problem_description.trim(),
        pickup_date, pickup_time, address_line.trim(), city.trim(), pincode.trim()
      ]
    );

    const repair = inserted.rows[0];

    // Notification if logged in
    if (userId) {
      await db.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES ($1, $2, $3, 'repair')`,
        [
          userId,
          `Repair Request Booked: ${requestNumber}`,
          `Your service request #${requestNumber} for ${brand} ${model} has been scheduled for doorstep pickup on ${pickup_date}.`
        ]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Repair service booked successfully! Technician pickup scheduled.',
      repair
    });
  } catch (error) {
    console.error('Repair Booking Error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit repair request.' });
  }
});

// GET /api/repairs/track/:requestNumber
router.get('/track/:requestNumber', async (req, res) => {
  try {
    const { requestNumber } = req.params;
    const { phone } = req.query;

    let queryText = 'SELECT * FROM repair_requests WHERE request_number = $1';
    const params = [requestNumber.trim()];

    if (phone) {
      queryText += ' AND customer_phone = $2';
      params.push(phone.trim());
    }

    const result = await db.query(queryText, params);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Repair request not found. Check your ticket number.' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Repair tracking error:', error);
    res.status(500).json({ success: false, message: 'Failed to track repair request.' });
  }
});

// POST /api/repairs/:id/approve-estimate (CUSTOMER APPROVAL)
router.post('/:id/approve-estimate', authenticateToken, async (req, res) => {
  try {
    const { approved } = req.body; // true or false
    const repairId = parseInt(req.params.id, 10);

    const repairRes = await db.query('SELECT * FROM repair_requests WHERE id = $1 AND user_id = $2', [repairId, req.user.id]);
    if (repairRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Repair record not found.' });
    }

    const nextStatus = approved ? 'Repair In Progress' : 'Cancelled';
    const updated = await db.query(
      `UPDATE repair_requests
       SET customer_approved = $1, status = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [approved, nextStatus, repairId]
    );

    res.json({
      success: true,
      message: approved ? 'Repair estimate approved! Technician will begin repair.' : 'Repair estimate declined.',
      data: updated.rows[0]
    });
  } catch (error) {
    console.error('Estimate approval error:', error);
    res.status(500).json({ success: false, message: 'Failed to update repair approval.' });
  }
});

// GET /api/repairs/my-repairs
router.get('/my-repairs', authenticateToken, async (req, res) => {
  try {
    const repairs = await db.query(
      'SELECT * FROM repair_requests WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, data: repairs.rows });
  } catch (error) {
    console.error('My repairs error:', error);
    res.status(500).json({ success: false, message: 'Failed to load repair history.' });
  }
});

module.exports = router;
