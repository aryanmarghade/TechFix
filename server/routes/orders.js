const express = require('express');
const db = require('../db');
const { optionalAuth, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/service-areas/check?pincode=400050
router.get('/service-areas/check', async (req, res) => {
  try {
    const { pincode } = req.query;
    if (!pincode) {
      return res.status(400).json({ success: false, message: 'Pincode is required.' });
    }

    const areaRes = await db.query('SELECT * FROM service_areas WHERE pincode = $1 AND active = true', [pincode.trim()]);
    if (areaRes.rowCount > 0) {
      return res.json({
        success: true,
        available: true,
        area: areaRes.rows[0],
        message: `Pickup & Delivery is available in ${areaRes.rows[0].city} (${pincode})!`
      });
    } else {
      return res.json({
        success: true,
        available: false,
        message: `Doorstep Pickup & Delivery is currently limited to Mumbai & Thane service zones (Pincode: ${pincode}). Contact support for custom shipping.`
      });
    }
  } catch (error) {
    console.error('Service area check error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify service area.' });
  }
});

// POST /api/orders/apply-coupon
router.post('/apply-coupon', async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Coupon code is required.' });
    }
    const orderSubtotal = parseFloat(subtotal) || 0;
    const couponRes = await db.query(
      'SELECT * FROM coupons WHERE code = $1 AND active = true',
      [code.trim().toUpperCase()]
    );

    if (couponRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
    }

    const coupon = couponRes.rows[0];

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon code has expired.' });
    }

    if (coupon.times_used >= coupon.usage_limit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached.' });
    }

    if (orderSubtotal < parseFloat(coupon.min_order_amount)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${parseFloat(coupon.min_order_amount).toLocaleString('en-IN')} required for coupon ${coupon.code}.`
      });
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (orderSubtotal * parseFloat(coupon.discount_value)) / 100;
      if (coupon.max_discount_amount && discount > parseFloat(coupon.max_discount_amount)) {
        discount = parseFloat(coupon.max_discount_amount);
      }
    } else {
      discount = parseFloat(coupon.discount_value);
    }

    discount = Math.min(discount, orderSubtotal);

    res.json({
      success: true,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: parseFloat(coupon.discount_value),
      discount_amount: discount,
      message: `Coupon "${coupon.code}" applied! You saved ₹${discount.toLocaleString('en-IN')}`
    });
  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({ success: false, message: 'Failed to validate coupon code.' });
  }
});


// POST /api/orders (PLACE COD ORDER WITH TRANSACTION & STOCK DEDUCTION)
// Also support POST /api/orders/checkout alias
const handleCheckout = async (req, res) => {
  const client = await db.getClient();
  try {
    const customer_name = req.body.customer_name || req.body.customerName || (req.body.shippingAddress && req.body.shippingAddress.fullName) || (req.user ? req.user.name : null);
    const customer_email = req.body.customer_email || req.body.customerEmail || (req.user ? req.user.email : null);
    const customer_phone = req.body.customer_phone || req.body.customerPhone || (req.body.shippingAddress && req.body.shippingAddress.phone) || (req.user ? req.user.phone : null);
    
    let shipping_address = req.body.shipping_address;
    let city = req.body.city;
    let pincode = req.body.pincode;

    if (req.body.shippingAddress) {
      const sa = req.body.shippingAddress;
      shipping_address = shipping_address || [sa.addressLine1, sa.addressLine2].filter(Boolean).join(', ');
      city = city || sa.city;
      pincode = pincode || sa.pincode;
    }

    const delivery_instructions = req.body.delivery_instructions || req.body.deliveryInstructions;
    let items = req.body.items; // array of { product_id, productId, quantity, custom_build_details }

    if (Array.isArray(items)) {
      items = items.map(it => ({
        product_id: it.product_id !== undefined ? it.product_id : it.productId,
        quantity: it.quantity,
        custom_build_details: it.custom_build_details || it.customBuildDetails
      }));
    }

    // 1. Validation
    if (!customer_name || !customer_email || !customer_phone || !shipping_address || !city || !pincode) {
      return res.status(400).json({ success: false, message: 'All customer and delivery address fields are required.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty. Please add products to checkout.' });
    }

    // 2. Validate Service Pincode
    const areaRes = await db.query('SELECT * FROM service_areas WHERE pincode = $1 AND active = true', [pincode.trim()]);
    let deliveryFee = 99.00;
    if (areaRes.rowCount > 0) {
      deliveryFee = parseFloat(areaRes.rows[0].delivery_charge);
    }

    await client.query('BEGIN');

    // 3. Server-side Recalculate Subtotal & Verify Stock
    let calculatedSubtotal = 0;
    const validatedOrderItems = [];

    for (const item of items) {
      const quantity = parseInt(item.quantity, 10);
      if (isNaN(quantity) || quantity <= 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Invalid product quantity specified.' });
      }

      // Check if custom PC build item or regular product
      if (item.custom_build_details) {
        // Custom PC Build item
        const buildPrice = parseFloat(item.custom_build_details.total_price || item.unit_price);
        const lineTotal = buildPrice * quantity;
        calculatedSubtotal += lineTotal;
        validatedOrderItems.push({
          product_id: null,
          product_name_snapshot: item.custom_build_details.name || 'Custom PC Build',
          unit_price: buildPrice,
          quantity: quantity,
          line_total: lineTotal,
          custom_build_details: item.custom_build_details
        });
      } else {
        // Regular Product
        const prodRes = await client.query(
          'SELECT id, name, price, stock_quantity, active FROM products WHERE id = $1 FOR UPDATE',
          [item.product_id]
        );

        if (prodRes.rowCount === 0 || !prodRes.rows[0].active) {
          await client.query('ROLLBACK');
          return res.status(400).json({ success: false, message: `A product in your cart is no longer available.` });
        }

        const product = prodRes.rows[0];

        if (product.stock_quantity < quantity) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for "${product.name}". Available: ${product.stock_quantity}, Requested: ${quantity}`
          });
        }

        // Deduct stock safely
        await client.query(
          'UPDATE products SET stock_quantity = stock_quantity - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [quantity, product.id]
        );

        const unitPrice = parseFloat(product.price);
        const lineTotal = unitPrice * quantity;
        calculatedSubtotal += lineTotal;

        validatedOrderItems.push({
          product_id: product.id,
          product_name_snapshot: product.name,
          unit_price: unitPrice,
          quantity: quantity,
          line_total: lineTotal,
          custom_build_details: null
        });
      }
    }

    // Apply free delivery threshold if configured
    if (areaRes.rowCount > 0 && calculatedSubtotal >= parseFloat(areaRes.rows[0].free_delivery_threshold)) {
      deliveryFee = 0.00;
    } else if (calculatedSubtotal >= 999.00) {
      deliveryFee = 0.00;
    }

    // Optional Coupon code application
    const coupon_code = req.body.coupon_code || req.body.couponCode;
    let discountAmount = 0.00;
    let appliedCoupon = null;

    if (coupon_code && coupon_code.trim()) {
      const cRes = await client.query(
        'SELECT * FROM coupons WHERE code = $1 AND active = true FOR UPDATE',
        [coupon_code.trim().toUpperCase()]
      );
      if (cRes.rowCount > 0) {
        const cp = cRes.rows[0];
        const isNotExpired = !cp.expires_at || new Date(cp.expires_at) >= new Date();
        const hasUsage = cp.times_used < cp.usage_limit;
        const meetsMin = calculatedSubtotal >= parseFloat(cp.min_order_amount);

        if (isNotExpired && hasUsage && meetsMin) {
          appliedCoupon = cp;
          if (cp.discount_type === 'percentage') {
            discountAmount = (calculatedSubtotal * parseFloat(cp.discount_value)) / 100;
            if (cp.max_discount_amount && discountAmount > parseFloat(cp.max_discount_amount)) {
              discountAmount = parseFloat(cp.max_discount_amount);
            }
          } else {
            discountAmount = parseFloat(cp.discount_value);
          }
          discountAmount = Math.min(discountAmount, calculatedSubtotal);

          // Increment usage count
          await client.query('UPDATE coupons SET times_used = times_used + 1 WHERE id = $1', [cp.id]);
        }
      }
    }

    const calculatedTotal = Math.max(0, calculatedSubtotal - discountAmount + deliveryFee);

    // COD Max Limit check (e.g., ₹1,50,000)
    const maxCod = parseFloat(process.env.MAX_COD_LIMIT || 150000);
    if (calculatedTotal > maxCod) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Order amount (₹${calculatedTotal.toLocaleString('en-IN')}) exceeds maximum Cash On Delivery limit of ₹${maxCod.toLocaleString('en-IN')}. Please split your order or contact store.`
      });
    }

    // Generate Unique Order Number
    const orderNumber = `TF-ORD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const userId = req.user ? req.user.id : null;

    // Insert Order
    const orderInsert = await client.query(
      `INSERT INTO orders (
        order_number, user_id, customer_name, customer_email, customer_phone,
        shipping_address, city, pincode, subtotal, delivery_fee, total,
        payment_method, payment_status, order_status, delivery_instructions,
        coupon_code, discount_amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'COD', 'pending', 'Order Placed', $12, $13, $14)
      RETURNING *`,
      [
        orderNumber, userId, customer_name.trim(), customer_email.toLowerCase().trim(),
        customer_phone.trim(), shipping_address.trim(), city.trim(), pincode.trim(),
        calculatedSubtotal, deliveryFee, calculatedTotal, delivery_instructions || null,
        appliedCoupon ? appliedCoupon.code : null, discountAmount
      ]
    );

    const createdOrder = orderInsert.rows[0];

    // Insert Order Items
    for (const oi of validatedOrderItems) {
      await client.query(
        `INSERT INTO order_items (
          order_id, product_id, product_name_snapshot, unit_price, quantity, line_total, custom_build_details
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          createdOrder.id, oi.product_id, oi.product_name_snapshot,
          oi.unit_price, oi.quantity, oi.line_total,
          oi.custom_build_details ? JSON.stringify(oi.custom_build_details) : null
        ]
      );
    }

    // Create Notification if user is logged in
    if (userId) {
      await client.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES ($1, $2, $3, 'order')`,
        [
          userId,
          `Order Placed: ${orderNumber}`,
          `Your Cash on Delivery order #${orderNumber} for ₹${calculatedTotal.toLocaleString('en-IN')} has been placed successfully.`
        ]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Cash on Delivery verified.',
      order: createdOrder,
      items: validatedOrderItems
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Order Placement Error:', error);
    res.status(500).json({ success: false, message: 'Failed to place order. Transaction was safely aborted.' });
  } finally {
    client.release();
  }
};

router.post('/', authenticateToken, handleCheckout);
router.post('/checkout', authenticateToken, handleCheckout);

// GET /api/orders/track/:orderNumber
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { phone } = req.query;

    let queryText = 'SELECT * FROM orders WHERE order_number = $1';
    const params = [orderNumber.trim()];

    if (phone) {
      queryText += ' AND customer_phone = $2';
      params.push(phone.trim());
    }

    const orderRes = await db.query(queryText, params);
    if (orderRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'No matching order found with the provided order number.' });
    }

    const order = orderRes.rows[0];

    const itemsRes = await db.query(`
      SELECT oi.*, p.image_url, p.slug
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [order.id]);

    order.items = itemsRes.rows;

    res.json({ success: true, data: order, order: order });
  } catch (error) {
    console.error('Order tracking error:', error);
    res.status(500).json({ success: false, message: 'Failed to track order.' });
  }
});

// GET /api/orders/my-orders (AUTHENTICATED USER ORDERS)
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const ordersRes = await db.query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );

    for (const ord of ordersRes.rows) {
      const itemsRes = await db.query(`
        SELECT oi.*, p.image_url, p.slug
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
      `, [ord.id]);
      ord.items = itemsRes.rows;
    }

    res.json({ success: true, data: ordersRes.rows });
  } catch (error) {
    console.error('Fetch my-orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to load order history.' });
  }
});

// GET /api/orders/:id/invoice (HTML/Printable Invoice)
router.get('/:id/invoice', optionalAuth, async (req, res) => {
  try {
    const identifier = req.params.id;
    const isNumeric = /^\d+$/.test(identifier);

    const orderRes = await db.query(
      `SELECT * FROM orders WHERE ${isNumeric ? 'id = $1' : 'order_number = $1'}`,
      [isNumeric ? parseInt(identifier, 10) : identifier]
    );

    if (orderRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Order not found for invoice.' });
    }

    const order = orderRes.rows[0];

    // Authorization: Must be order owner, or admin, or public track with phone verification
    if (order.user_id) {
      if (!req.user || (req.user.role !== 'admin' && req.user.id !== order.user_id)) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view this invoice.' });
      }
    }

    const itemsRes = await db.query(`
      SELECT oi.*, p.sku
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [order.id]);

    order.items = itemsRes.rows;

    // Return structured invoice data or printable HTML
    if (req.query.format === 'json') {
      return res.json({ success: true, data: order });
    }

    const itemsRowsHtml = order.items.map((it, idx) => `
      <tr>
        <td style="padding:10px; border-bottom:1px solid #e2e8f0; text-align:center;">${idx + 1}</td>
        <td style="padding:10px; border-bottom:1px solid #e2e8f0;">
          <strong>${it.product_name_snapshot}</strong>
          ${it.sku ? `<br><small style="color:#64748b;">SKU: ${it.sku}</small>` : ''}
        </td>
        <td style="padding:10px; border-bottom:1px solid #e2e8f0; text-align:right;">₹${parseFloat(it.unit_price).toLocaleString('en-IN')}</td>
        <td style="padding:10px; border-bottom:1px solid #e2e8f0; text-align:center;">${it.quantity}</td>
        <td style="padding:10px; border-bottom:1px solid #e2e8f0; text-align:right;">₹${parseFloat(it.line_total).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice #${order.order_number} — TechFix</title>
        <style>
          body { font-family: 'Inter', -apple-system, sans-serif; color: #1e293b; margin: 0; padding: 40px; background: #fff; }
          .invoice-box { max-width: 800px; margin: auto; border: 1px solid #e2e8f0; border-radius: 10px; padding: 30px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0284c7; padding-bottom: 20px; margin-bottom: 25px; }
          .logo { font-size: 24px; font-weight: 800; color: #0f172a; }
          .logo-badge { background: #0284c7; color: white; padding: 4px 8px; border-radius: 4px; }
          .text-fix { color: #f97316; }
          .table { width: 100%; border-collapse: collapse; margin: 25px 0; }
          .table th { background: #f8fafc; padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
          .totals { width: 300px; margin-left: auto; margin-top: 20px; }
          .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
          .totals-grand { font-size: 18px; font-weight: 800; color: #0284c7; border-top: 2px solid #e2e8f0; padding-top: 10px; margin-top: 6px; }
          @media print {
            body { padding: 0; }
            .invoice-box { border: none; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="no-print" style="text-align:right; margin-bottom:15px;">
            <button onclick="window.print()" style="background:#0284c7; color:#fff; border:none; padding:8px 16px; border-radius:6px; font-weight:600; cursor:pointer;">🖨️ Print / Download PDF</button>
          </div>
          <div class="header">
            <div>
              <div class="logo"><span class="logo-badge">TF</span> TECH<span class="text-fix">FIX</span></div>
              <div style="font-size:13px; color:#64748b; margin-top:4px;">Buy. Build. Repair. Delivered.</div>
              <div style="font-size:12px; color:#64748b;">Mumbai & Thane, Maharashtra</div>
            </div>
            <div style="text-align:right;">
              <h2 style="margin:0; color:#0284c7;">TAX INVOICE</h2>
              <div style="font-size:14px; font-weight:700; margin-top:4px;">#${order.order_number}</div>
              <div style="font-size:13px; color:#64748b;">Date: ${new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; margin-bottom:25px; font-size:14px; line-height:1.5;">
            <div>
              <strong style="color:#0f172a;">Billed & Delivered To:</strong><br>
              ${order.customer_name}<br>
              ${order.shipping_address}<br>
              ${order.city} - ${order.pincode}<br>
              Phone: ${order.customer_phone}<br>
              Email: ${order.customer_email}
            </div>
            <div style="text-align:right;">
              <strong style="color:#0f172a;">Order Details:</strong><br>
              Payment Method: <strong>${order.payment_method}</strong><br>
              Payment Status: <strong>${order.payment_status}</strong><br>
              Order Status: <strong>${order.order_status}</strong>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th style="text-align:center; width:40px;">#</th>
                <th>Item Description</th>
                <th style="text-align:right; width:120px;">Unit Price</th>
                <th style="text-align:center; width:60px;">Qty</th>
                <th style="text-align:right; width:120px;">Line Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRowsHtml}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row"><span>Subtotal:</span><span>₹${parseFloat(order.subtotal).toLocaleString('en-IN')}</span></div>
            ${order.discount_amount && parseFloat(order.discount_amount) > 0 ? `
              <div class="totals-row" style="color:#16a34a;"><span>Coupon Discount (${order.coupon_code}):</span><span>-₹${parseFloat(order.discount_amount).toLocaleString('en-IN')}</span></div>
            ` : ''}
            <div class="totals-row"><span>Delivery Fee:</span><span>${parseFloat(order.delivery_fee) === 0 ? 'FREE' : '₹' + parseFloat(order.delivery_fee).toLocaleString('en-IN')}</span></div>
            <div class="totals-row totals-grand"><span>Total (COD):</span><span>₹${parseFloat(order.total).toLocaleString('en-IN')}</span></div>
          </div>

          <div style="margin-top:40px; padding-top:20px; border-top:1px solid #e2e8f0; font-size:12px; color:#64748b; text-align:center;">
            Thank you for choosing TechFix! Official warranty supported by respective manufacturers.<br>
            For support or warranty claims, contact <strong>+91 98765 43210</strong> or email <strong>support@techfix.demo</strong>.
          </div>
        </div>
      </body>
      </html>
    `;

    res.send(invoiceHtml);
  } catch (error) {
    console.error('Invoice generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate invoice.' });
  }
});

module.exports = router;

