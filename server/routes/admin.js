const express = require('express');
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require admin token
router.use(authenticateToken, requireAdmin);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const daysParam = parseInt(req.query.days, 10);
    const intervalDays = [7, 30, 90].includes(daysParam) ? daysParam : 7;

    const ordersStats = await db.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN payment_method = 'COD' THEN 1 END) as cod_orders,
        COALESCE(SUM(total), 0) as total_revenue,
        COUNT(CASE WHEN order_status IN ('Order Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery') THEN 1 END) as pending_orders,
        COUNT(CASE WHEN order_status IN ('Delivered', 'Completed') THEN 1 END) as completed_orders
      FROM orders
    `);

    const repairsStats = await db.query(`
      SELECT 
        COUNT(*) as total_repairs,
        COUNT(CASE WHEN status NOT IN ('Delivered', 'Cancelled', 'Completed') THEN 1 END) as active_repairs,
        COUNT(CASE WHEN status = 'Request Received' THEN 1 END) as pending_pickup
      FROM repair_requests
    `);

    const ticketsStats = await db.query(`
      SELECT 
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN status IN ('Open', 'In Progress') THEN 1 END) as open_tickets
      FROM support_tickets
    `);

    const stockStats = await db.query(`
      SELECT COUNT(*) as low_stock_count,
        COUNT(CASE WHEN stock_quantity = 0 THEN 1 END) as out_of_stock_count,
        COUNT(*) as total_products
      FROM products WHERE active = true
    `);

    const userStats = await db.query(`
      SELECT COUNT(*) as total_users FROM users WHERE role = 'customer'
    `);

    // Sales by Day (dynamic range: 7, 30, 90 days)
    const salesByDay = await db.query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as day,
             COUNT(*) as order_count,
             COALESCE(SUM(total), 0) as revenue
      FROM orders
      WHERE created_at >= NOW() - ($1 || ' days')::INTERVAL
      GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
      ORDER BY day ASC
    `, [intervalDays]);

    // Orders by status
    const ordersByStatus = await db.query(`
      SELECT order_status, COUNT(*) as count
      FROM orders
      GROUP BY order_status
      ORDER BY count DESC
    `);

    // Top Selling Products
    const topProducts = await db.query(`
      SELECT oi.product_name_snapshot, SUM(oi.quantity) as total_qty, SUM(oi.line_total) as total_sales
      FROM order_items oi
      GROUP BY oi.product_name_snapshot
      ORDER BY total_qty DESC
      LIMIT 5
    `);

    // Revenue by Category
    const revenueByCategory = await db.query(`
      SELECT c.name as category_name, COALESCE(SUM(oi.line_total), 0) as revenue, SUM(oi.quantity) as items_sold
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      GROUP BY c.name
      ORDER BY revenue DESC
      LIMIT 6
    `);

    res.json({
      success: true,
      data: {
        orders: ordersStats.rows[0],
        repairs: repairsStats.rows[0],
        tickets: ticketsStats.rows[0],
        totalProducts: parseInt(stockStats.rows[0].total_products, 10),
        lowStockCount: parseInt(stockStats.rows[0].low_stock_count, 10),
        outOfStockCount: parseInt(stockStats.rows[0].out_of_stock_count, 10),
        totalUsers: parseInt(userStats.rows[0].total_users, 10),
        salesByDay: salesByDay.rows,
        ordersByStatus: ordersByStatus.rows,
        topProducts: topProducts.rows,
        revenueByCategory: revenueByCategory.rows
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to load stats.' });
  }
});


// GET /api/admin/orders
router.get('/orders', async (req, res) => {
  try {
    const ordersRes = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
    for (const ord of ordersRes.rows) {
      const itemsRes = await db.query('SELECT * FROM order_items WHERE order_id = $1', [ord.id]);
      ord.items = itemsRes.rows;
    }
    res.json({ success: true, data: ordersRes.rows });
  } catch (error) {
    console.error('Admin orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
});

// PUT /api/admin/orders/:id/status
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { order_status, payment_status } = req.body;
    const identifier = req.params.id;
    const isNumeric = /^\d+$/.test(identifier);

    const updated = await db.query(
      `UPDATE orders
       SET order_status = COALESCE($1, order_status),
           payment_status = COALESCE($2, payment_status),
           updated_at = CURRENT_TIMESTAMP
       WHERE ${isNumeric ? 'id = $3' : 'order_number = $3'}
       RETURNING *`,
      [order_status, payment_status, isNumeric ? parseInt(identifier, 10) : identifier]
    );

    if (updated.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = updated.rows[0];

    // Notification
    if (order.user_id) {
      await db.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES ($1, $2, $3, 'order')`,
        [
          order.user_id,
          `Order Status Updated: ${order.order_number}`,
          `Your order #${order.order_number} is now marked as "${order.order_status}".`
        ]
      );
    }

    res.json({ success: true, message: 'Order updated.', data: order });
  } catch (error) {
    console.error('Admin update order error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order.' });
  }
});

// GET /api/admin/repairs
router.get('/repairs', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM repair_requests ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Admin repairs error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch repairs.' });
  }
});

// PUT /api/admin/repairs/:id & /api/admin/repairs/:id/status
const handleRepairUpdate = async (req, res) => {
  try {
    const { status, diagnosis, estimate_amount, customer_approved } = req.body;
    const repairId = parseInt(req.params.id, 10);

    const updated = await db.query(
      `UPDATE repair_requests
       SET status = COALESCE($1, status),
           diagnosis = COALESCE($2, diagnosis),
           estimate_amount = COALESCE($3, estimate_amount),
           customer_approved = COALESCE($4, customer_approved),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [status, diagnosis, estimate_amount, customer_approved, repairId]
    );

    if (updated.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Repair record not found.' });
    }

    const repair = updated.rows[0];

    // Notification
    if (repair.user_id) {
      await db.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES ($1, $2, $3, 'repair')`,
        [
          repair.user_id,
          `Repair Request Updated: ${repair.request_number}`,
          `Your repair request #${repair.request_number} has been updated to "${repair.status}".`
        ]
      );
    }

    res.json({ success: true, message: 'Repair request updated.', data: repair });
  } catch (error) {
    console.error('Admin update repair error:', error);
    res.status(500).json({ success: false, message: 'Failed to update repair.' });
  }
};

router.put('/repairs/:id', handleRepairUpdate);
router.put('/repairs/:id/status', handleRepairUpdate);

// GET /api/admin/products
router.get('/products', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Admin products error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
});

// POST /api/admin/products (CREATE PRODUCT)
router.post('/products', async (req, res) => {
  try {
    const {
      category_id,
      name,
      slug,
      brand,
      sku,
      description,
      short_description,
      price,
      compare_at_price,
      stock_quantity,
      image_url,
      featured,
      active
    } = req.body;

    const inserted = await db.query(
      `INSERT INTO products (
        category_id, name, slug, brand, sku, description, short_description,
        price, compare_at_price, stock_quantity, image_url, featured, active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        parseInt(category_id, 10), name.trim(), slug.trim(), brand.trim(), sku.trim(),
        description, short_description, parseFloat(price),
        compare_at_price ? parseFloat(compare_at_price) : null,
        parseInt(stock_quantity, 10) || 0, image_url, !!featured, active !== false
      ]
    );

    res.status(201).json({ success: true, message: 'Product added successfully!', data: inserted.rows[0] });
  } catch (error) {
    console.error('Admin add product error:', error);
    res.status(500).json({ success: false, message: 'Failed to add product.' });
  }
});

// PUT /api/admin/products/:id (UPDATE PRODUCT & STOCK)
router.put('/products/:id', async (req, res) => {
  try {
    const {
      category_id,
      name,
      brand,
      price,
      compare_at_price,
      stock_quantity,
      image_url,
      featured,
      active,
      description,
      short_description
    } = req.body;
    const productId = parseInt(req.params.id, 10);

    const updated = await db.query(
      `UPDATE products
       SET category_id = COALESCE($1, category_id),
           name = COALESCE($2, name),
           brand = COALESCE($3, brand),
           price = COALESCE($4, price),
           compare_at_price = $5,
           stock_quantity = COALESCE($6, stock_quantity),
           image_url = COALESCE($7, image_url),
           featured = COALESCE($8, featured),
           active = COALESCE($9, active),
           description = COALESCE($10, description),
           short_description = COALESCE($11, short_description),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $12
       RETURNING *`,
      [
        category_id ? parseInt(category_id, 10) : null,
        name ? name.trim() : null,
        brand ? brand.trim() : null,
        price ? parseFloat(price) : null,
        compare_at_price ? parseFloat(compare_at_price) : null,
        stock_quantity !== undefined ? parseInt(stock_quantity, 10) : null,
        image_url,
        featured,
        active,
        description,
        short_description,
        productId
      ]
    );

    if (updated.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({ success: true, message: 'Product updated successfully!', data: updated.rows[0] });
  } catch (error) {
    console.error('Admin update product error:', error);
    res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
});

// DELETE /api/admin/products/:id (SAFE DEACTIVATE OR DELETE IF UNREFERENCED)
router.delete('/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    
    // Check if referenced in order_items
    const orderCheck = await db.query('SELECT count(*) FROM order_items WHERE product_id = $1', [productId]);
    const isReferenced = parseInt(orderCheck.rows[0].count, 10) > 0;

    if (isReferenced) {
      // Safe deactivation to preserve past order history
      await db.query('UPDATE products SET active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [productId]);
      return res.json({
        success: true,
        message: 'Product is referenced in previous orders. Deactivated from public store to preserve order history.'
      });
    }

    // Clean up auxiliary child records safely
    await db.query('DELETE FROM product_specs WHERE product_id = $1', [productId]);
    await db.query('DELETE FROM product_images WHERE product_id = $1', [productId]);
    await db.query('DELETE FROM product_reviews WHERE product_id = $1', [productId]);
    await db.query('DELETE FROM wishlists WHERE product_id = $1', [productId]);
    await db.query('DELETE FROM components WHERE product_id = $1', [productId]);
    await db.query('DELETE FROM products WHERE id = $1', [productId]);

    res.json({ success: true, message: 'Product permanently deleted.' });
  } catch (error) {
    console.error('Admin delete product error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
});

// GET /api/admin/products/export/csv
router.get('/products/export/csv', async (req, res) => {
  try {
    const productsRes = await db.query(`
      SELECT p.id, p.sku, p.name, p.brand, c.name as category, p.price, p.compare_at_price, p.stock_quantity, p.active, p.featured, p.image_url
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id ASC
    `);

    const headers = ['id', 'sku', 'name', 'brand', 'category', 'price', 'compare_at_price', 'stock_quantity', 'active', 'featured', 'image_url'];
    let csvContent = headers.join(',') + '\n';

    productsRes.rows.forEach(p => {
      const row = [
        p.id,
        `"${(p.sku || '').replace(/"/g, '""')}"`,
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${(p.brand || '').replace(/"/g, '""')}"`,
        `"${(p.category || '').replace(/"/g, '""')}"`,
        p.price,
        p.compare_at_price || '',
        p.stock_quantity,
        p.active ? 'true' : 'false',
        p.featured ? 'true' : 'false',
        `"${(p.image_url || '').replace(/"/g, '""')}"`
      ];
      csvContent += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="techfix-products-catalog.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error('CSV Export error:', error);
    res.status(500).json({ success: false, message: 'Failed to export CSV.' });
  }
});

// POST /api/admin/products/import/csv
router.post('/products/import/csv', express.text({ type: '*/*', limit: '10mb' }), async (req, res) => {
  try {
    const csvData = typeof req.body === 'string' ? req.body : req.body.toString('utf8');
    if (!csvData || !csvData.trim()) {
      return res.status(400).json({ success: false, message: 'CSV content is empty.' });
    }

    const lines = csvData.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      return res.status(400).json({ success: false, message: 'CSV must contain headers and at least 1 data row.' });
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
    const nameIdx = headers.indexOf('name');
    const skuIdx = headers.indexOf('sku');
    const priceIdx = headers.indexOf('price');
    const stockIdx = headers.indexOf('stock_quantity');
    const brandIdx = headers.indexOf('brand');

    if (nameIdx === -1 || priceIdx === -1) {
      return res.status(400).json({ success: false, message: 'CSV missing required headers: name, price.' });
    }

    let successCount = 0;
    const errors = [];

    // Parse categories cache
    const cats = await db.query('SELECT id, LOWER(name) as name, slug FROM categories');
    const catMap = {};
    cats.rows.forEach(c => {
      catMap[c.name] = c.id;
      catMap[c.slug] = c.id;
    });

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Simple regex split for CSV handling quoted values
      const cols = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
      const cleanCols = cols.map(c => c.trim().replace(/^"|"$/g, ''));

      const name = cleanCols[nameIdx];
      const price = parseFloat(cleanCols[priceIdx]);
      const brand = brandIdx > -1 ? cleanCols[brandIdx] : 'TechFix';
      const sku = skuIdx > -1 ? cleanCols[skuIdx] : `SKU-${Date.now()}-${i}`;
      const stock = stockIdx > -1 ? parseInt(cleanCols[stockIdx], 10) : 10;

      if (!name || isNaN(price) || price <= 0) {
        errors.push({ row: i + 1, reason: 'Invalid name or price' });
        continue;
      }

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      try {
        await db.query(`
          INSERT INTO products (category_id, name, slug, brand, sku, price, stock_quantity, active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, true)
          ON CONFLICT (slug) DO UPDATE
          SET price = EXCLUDED.price, stock_quantity = EXCLUDED.stock_quantity, updated_at = CURRENT_TIMESTAMP
        `, [1, name, slug, brand, sku, price, isNaN(stock) ? 10 : stock]);
        successCount++;
      } catch (rowErr) {
        errors.push({ row: i + 1, reason: rowErr.message });
      }
    }

    res.json({
      success: true,
      message: `Import finished: ${successCount} rows processed successfully, ${errors.length} failed.`,
      successCount,
      failedCount: errors.length,
      errors
    });
  } catch (error) {
    console.error('CSV import error:', error);
    res.status(500).json({ success: false, message: 'Failed to process CSV import.' });
  }
});

// GET /api/admin/reviews (MODERATION)
router.get('/reviews', async (req, res) => {
  try {
    const reviewsRes = await db.query(`
      SELECT pr.*, p.name as product_name, p.slug as product_slug
      FROM product_reviews pr
      JOIN products p ON pr.product_id = p.id
      ORDER BY pr.created_at DESC
      LIMIT 100
    `);
    res.json({ success: true, data: reviewsRes.rows });
  } catch (error) {
    console.error('Admin reviews error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
});

// PUT /api/admin/reviews/:id/approve
router.put('/reviews/:id/approve', async (req, res) => {
  try {
    const { approved } = req.body;
    const revId = parseInt(req.params.id, 10);
    const updated = await db.query(
      'UPDATE product_reviews SET approved = $1 WHERE id = $2 RETURNING *',
      [approved !== false, revId]
    );
    if (updated.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    res.json({ success: true, message: `Review approval set to ${approved !== false}.`, data: updated.rows[0] });
  } catch (error) {
    console.error('Admin review approval error:', error);
    res.status(500).json({ success: false, message: 'Failed to update review approval.' });
  }
});

// DELETE /api/admin/reviews/:id
router.delete('/reviews/:id', async (req, res) => {
  try {
    const revId = parseInt(req.params.id, 10);
    await db.query('DELETE FROM product_reviews WHERE id = $1', [revId]);
    res.json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    console.error('Admin delete review error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
});


// GET /api/admin/tickets
router.get('/tickets', async (req, res) => {
  try {
    const tickets = await db.query('SELECT * FROM support_tickets ORDER BY updated_at DESC');
    for (const t of tickets.rows) {
      const msgs = await db.query('SELECT * FROM support_messages WHERE ticket_id = $1 ORDER BY created_at ASC', [t.id]);
      t.messages = msgs.rows;
    }
    res.json({ success: true, data: tickets.rows });
  } catch (error) {
    console.error('Admin tickets error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tickets.' });
  }
});

// GET /api/admin/service-areas
router.get('/service-areas', async (req, res) => {
  try {
    const areas = await db.query('SELECT * FROM service_areas ORDER BY id ASC');
    res.json({ success: true, data: areas.rows });
  } catch (error) {
    console.error('Admin service areas error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch service areas.' });
  }
});

// POST /api/admin/service-areas
router.post('/service-areas', async (req, res) => {
  try {
    const { city, state, pincode, delivery_charge, free_delivery_threshold } = req.body;
    const inserted = await db.query(
      `INSERT INTO service_areas (city, state, pincode, delivery_charge, free_delivery_threshold, active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING *`,
      [city.trim(), state.trim(), pincode.trim(), parseFloat(delivery_charge || 0), parseFloat(free_delivery_threshold || 999)]
    );
    res.status(201).json({ success: true, message: 'Service area added.', data: inserted.rows[0] });
  } catch (error) {
    console.error('Admin add service area error:', error);
    res.status(500).json({ success: false, message: 'Failed to add service area.' });
  }
});

// GET /api/admin/customers
router.get('/customers', async (req, res) => {
  try {
    const users = await db.query(`
      SELECT id, name, email, phone, role, status, created_at,
        (SELECT COUNT(*) FROM orders WHERE orders.user_id = users.id) as order_count,
        (SELECT COUNT(*) FROM repair_requests WHERE repair_requests.user_id = users.id) as repair_count
      FROM users
      WHERE role = 'customer'
      ORDER BY created_at DESC
    `);
    res.json({ success: true, data: users.rows });
  } catch (error) {
    console.error('Admin customers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customers.' });
  }
});

// PUT /api/admin/customers/:id/status
router.put('/customers/:id/status', async (req, res) => {
  try {
    const { status } = req.body; // 'active' or 'disabled'
    const userId = parseInt(req.params.id, 10);

    const updated = await db.query('UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, email, status', [status, userId]);
    res.json({ success: true, message: `Customer status updated to ${status}.`, data: updated.rows[0] });
  } catch (error) {
    console.error('Admin update customer status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update customer status.' });
  }
});
router.get('/coupons', async (req, res) => {
  try {
    const couponsRes = await db.query('SELECT * FROM coupons ORDER BY created_at DESC');
    res.json({ success: true, data: couponsRes.rows });
  } catch (error) {
    console.error('Admin coupons error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch coupons.' });
  }
});

// POST /api/admin/coupons
router.post('/coupons', async (req, res) => {
  try {
    const {
      code,
      discount_type,
      discount_value,
      min_order_amount,
      max_discount_amount,
      usage_limit,
      active,
      expires_at
    } = req.body;

    if (!code || !discount_value) {
      return res.status(400).json({ success: false, message: 'Coupon code and discount value are required.' });
    }

    const inserted = await db.query(
      `INSERT INTO coupons (
        code, discount_type, discount_value, min_order_amount, max_discount_amount,
        usage_limit, active, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        code.trim().toUpperCase(),
        discount_type || 'percentage',
        parseFloat(discount_value),
        parseFloat(min_order_amount || 0),
        max_discount_amount ? parseFloat(max_discount_amount) : null,
        parseInt(usage_limit, 10) || 1000,
        active !== false,
        expires_at ? new Date(expires_at) : null
      ]
    );

    res.status(201).json({ success: true, message: 'Coupon created successfully!', data: inserted.rows[0] });
  } catch (error) {
    console.error('Admin create coupon error:', error);
    res.status(500).json({ success: false, message: 'Failed to create coupon (code may already exist).' });
  }
});

// PUT /api/admin/coupons/:id
router.put('/coupons/:id', async (req, res) => {
  try {
    const { active, discount_value, min_order_amount, max_discount_amount, usage_limit } = req.body;
    const couponId = parseInt(req.params.id, 10);

    const updated = await db.query(
      `UPDATE coupons
       SET active = COALESCE($1, active),
           discount_value = COALESCE($2, discount_value),
           min_order_amount = COALESCE($3, min_order_amount),
           max_discount_amount = $4,
           usage_limit = COALESCE($5, usage_limit)
       WHERE id = $6
       RETURNING *`,
      [
        active,
        discount_value ? parseFloat(discount_value) : null,
        min_order_amount ? parseFloat(min_order_amount) : null,
        max_discount_amount ? parseFloat(max_discount_amount) : null,
        usage_limit ? parseInt(usage_limit, 10) : null,
        couponId
      ]
    );

    if (updated.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Coupon not found.' });
    }

    res.json({ success: true, message: 'Coupon updated successfully!', data: updated.rows[0] });
  } catch (error) {
    console.error('Admin update coupon error:', error);
    res.status(500).json({ success: false, message: 'Failed to update coupon.' });
  }
});

// DELETE /api/admin/coupons/:id
router.delete('/coupons/:id', async (req, res) => {
  try {
    const couponId = parseInt(req.params.id, 10);
    await db.query('DELETE FROM coupons WHERE id = $1', [couponId]);
    res.json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (error) {
    console.error('Admin delete coupon error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete coupon.' });
  }
});

module.exports = router;
