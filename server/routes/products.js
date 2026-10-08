const express = require('express');
const db = require('../db');
const { optionalAuth, authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/products/categories
router.get('/categories', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categories WHERE active = true ORDER BY sort_order ASC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
});

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      featured,
      search,
      sort,
      inStock,
      page = 1,
      limit = 24
    } = req.query;

    let queryText = `
      SELECT p.*, c.name as category_name, c.slug as category_slug,
        COALESCE(AVG(pr.rating), 0) as avg_rating,
        COUNT(pr.id) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_reviews pr ON p.id = pr.product_id AND pr.approved = true
      WHERE p.active = true
    `;
    const params = [];
    let paramIndex = 1;

    if (category) {
      const slugMap = {
        'gaming-mouse': 'gaming-mice',
        'normal-mouse': 'normal-mice',
        'gaming-chair': 'gaming-chairs',
        'office-chair': 'office-chairs',
        'mouse-pad': 'mouse-pads'
      };
      const resolvedSlug = slugMap[category] || category;
      queryText += ` AND (c.slug = $${paramIndex} OR c.slug = $${paramIndex + 1} OR c.id::text = $${paramIndex})`;
      params.push(category, resolvedSlug);
      paramIndex += 2;
    }

    if (brand) {
      const brands = Array.isArray(brand) ? brand : [brand];
      queryText += ` AND p.brand = ANY($${paramIndex})`;
      params.push(brands);
      paramIndex++;
    }

    if (minPrice) {
      queryText += ` AND p.price >= $${paramIndex}`;
      params.push(parseFloat(minPrice));
      paramIndex++;
    }

    if (maxPrice) {
      queryText += ` AND p.price <= $${paramIndex}`;
      params.push(parseFloat(maxPrice));
      paramIndex++;
    }

    if (featured === 'true') {
      queryText += ` AND p.featured = true`;
    }

    if (inStock === 'true') {
      queryText += ` AND p.stock_quantity > 0`;
    }

    if (search) {
      queryText += ` AND (
        p.name ILIKE $${paramIndex} OR 
        p.brand ILIKE $${paramIndex} OR 
        p.sku ILIKE $${paramIndex} OR 
        p.description ILIKE $${paramIndex} OR
        p.short_description ILIKE $${paramIndex}
      )`;
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    queryText += ` GROUP BY p.id, c.name, c.slug`;

    // Sorting
    if (sort === 'price_asc') {
      queryText += ` ORDER BY p.price ASC`;
    } else if (sort === 'price_desc') {
      queryText += ` ORDER BY p.price DESC`;
    } else if (sort === 'newest') {
      queryText += ` ORDER BY p.created_at DESC`;
    } else if (sort === 'popular') {
      queryText += ` ORDER BY avg_rating DESC, p.id DESC`;
    } else {
      queryText += ` ORDER BY p.featured DESC, p.id ASC`;
    }

    // Pagination
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit, 10), offset);

    const result = await db.query(queryText, params);

    // Also get distinct brands for current category filter
    let brandsQuery = `SELECT DISTINCT brand FROM products WHERE active = true`;
    const brandParams = [];
    if (category) {
      brandsQuery += ` AND category_id = (SELECT id FROM categories WHERE slug = $1 OR id::text = $1)`;
      brandParams.push(category);
    }
    const brandsRes = await db.query(brandsQuery, brandParams);

    res.json({
      success: true,
      data: result.rows,
      brands: brandsRes.rows.map(b => b.brand),
      page: parseInt(page, 10),
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
});

// GET /api/products/slug/:slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const productRes = await db.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug,
        COALESCE(AVG(pr.rating), 0) as avg_rating,
        COUNT(pr.id) as review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_reviews pr ON p.id = pr.product_id AND pr.approved = true
      WHERE p.slug = $1 AND p.active = true
      GROUP BY p.id, c.name, c.slug
    `, [req.params.slug]);

    if (productRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const product = productRes.rows[0];

    // Get specs
    const specsRes = await db.query('SELECT spec_key, spec_value FROM product_specs WHERE product_id = $1 ORDER BY id ASC', [product.id]);
    product.specs = specsRes.rows;

    // Get images
    const imagesRes = await db.query('SELECT image_url, alt_text FROM product_images WHERE product_id = $1 ORDER BY sort_order ASC', [product.id]);
    product.gallery = imagesRes.rows;

    // Get reviews
    const reviewsRes = await db.query('SELECT * FROM product_reviews WHERE product_id = $1 AND approved = true ORDER BY created_at DESC', [product.id]);
    product.reviews = reviewsRes.rows;

    // Get related products in same category
    const relatedRes = await db.query(`
      SELECT id, name, slug, brand, price, compare_at_price, image_url, short_description, stock_quantity
      FROM products
      WHERE category_id = $1 AND id != $2 AND active = true
      LIMIT 4
    `, [product.category_id, product.id]);
    product.related = relatedRes.rows;

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product details.' });
  }
});

// POST /api/products/:id/review
router.post('/:id/review', authenticateToken, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const productId = parseInt(req.params.id, 10);

    if (!rating || !review) {
      return res.status(400).json({ success: false, message: 'Rating and review comment are required.' });
    }

    const inserted = await db.query(
      `INSERT INTO product_reviews (user_id, product_id, author_name, rating, review, approved)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING *`,
      [req.user.id, productId, req.user.name, parseInt(rating, 10), review.trim()]
    );

    res.status(201).json({ success: true, message: 'Review submitted successfully!', data: inserted.rows[0] });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
});

// GET /api/products/wishlist (USER WISHLIST)
router.get('/wishlist/my', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug, w.created_at as added_at
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE w.user_id = $1 AND p.active = true
      ORDER BY w.created_at DESC
    `, [req.user.id]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Fetch wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch wishlist.' });
  }
});

// POST /api/products/wishlist/toggle
router.post('/wishlist/toggle', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }
    const check = await db.query(
      'SELECT id FROM wishlists WHERE user_id = $1 AND product_id = $2',
      [req.user.id, parseInt(productId, 10)]
    );

    if (check.rowCount > 0) {
      await db.query('DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2', [req.user.id, parseInt(productId, 10)]);
      return res.json({ success: true, saved: false, message: 'Removed from wishlist.' });
    } else {
      await db.query('INSERT INTO wishlists (user_id, product_id) VALUES ($1, $2)', [req.user.id, parseInt(productId, 10)]);
      return res.json({ success: true, saved: true, message: 'Added to your wishlist!' });
    }
  } catch (error) {
    console.error('Wishlist toggle error:', error);
    res.status(500).json({ success: false, message: 'Failed to update wishlist.' });
  }
});

module.exports = router;
