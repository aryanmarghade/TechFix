const express = require('express');
const db = require('../db');
const { optionalAuth, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/support/tickets (CREATE TICKET)
router.post('/tickets', optionalAuth, async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      category,
      order_number,
      repair_request_number,
      subject,
      message
    } = req.body;

    if (!customer_name || !customer_email || !customer_phone || !category || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All support enquiry fields are required.' });
    }

    const ticketNumber = `TF-TCK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const userId = req.user ? req.user.id : null;

    const inserted = await db.query(
      `INSERT INTO support_tickets (
        user_id, ticket_number, customer_name, customer_email, customer_phone,
        category, order_number, repair_request_number, subject, message, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Open')
      RETURNING *`,
      [
        userId, ticketNumber, customer_name.trim(), customer_email.toLowerCase().trim(),
        customer_phone.trim(), category.trim(), order_number ? order_number.trim() : null,
        repair_request_number ? repair_request_number.trim() : null,
        subject.trim(), message.trim()
      ]
    );

    const ticket = inserted.rows[0];

    // Initial message
    await db.query(
      `INSERT INTO support_messages (ticket_id, sender_user_id, sender_name, is_admin, message)
       VALUES ($1, $2, $3, false, $4)`,
      [ticket.id, userId, customer_name.trim(), message.trim()]
    );

    res.status(201).json({
      success: true,
      message: 'Support ticket submitted successfully! Ticket ID generated.',
      ticket
    });
  } catch (error) {
    console.error('Create support ticket error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit support ticket.' });
  }
});

// GET /api/support/tickets/my-tickets
router.get('/tickets/my-tickets', authenticateToken, async (req, res) => {
  try {
    const tickets = await db.query(
      'SELECT * FROM support_tickets WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    for (const t of tickets.rows) {
      const msgRes = await db.query(
        'SELECT * FROM support_messages WHERE ticket_id = $1 ORDER BY created_at ASC',
        [t.id]
      );
      t.messages = msgRes.rows;
    }

    res.json({ success: true, data: tickets.rows });
  } catch (error) {
    console.error('Fetch my tickets error:', error);
    res.status(500).json({ success: false, message: 'Failed to load tickets.' });
  }
});

// POST /api/support/tickets/:id/reply
router.post('/tickets/:id/reply', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    const ticketId = parseInt(req.params.id, 10);

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty.' });
    }

    const tRes = await db.query('SELECT * FROM support_tickets WHERE id = $1', [ticketId]);
    if (tRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    const ticket = tRes.rows[0];
    const isAdmin = req.user.role === 'admin';

    // Update status if needed
    const newStatus = isAdmin ? 'Waiting for Customer' : 'In Progress';
    await db.query('UPDATE support_tickets SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newStatus, ticketId]);

    const msgInsert = await db.query(
      `INSERT INTO support_messages (ticket_id, sender_user_id, sender_name, is_admin, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [ticketId, req.user.id, req.user.name, isAdmin, message.trim()]
    );

    res.json({ success: true, message: 'Reply sent.', data: msgInsert.rows[0] });
  } catch (error) {
    console.error('Ticket reply error:', error);
    res.status(500).json({ success: false, message: 'Failed to send reply.' });
  }
});

module.exports = router;
