const db = require('./index');

async function migrate() {
  console.log('Running database extensions migration...');
  
  // 1. Create coupons table
  await db.query(`
    CREATE TABLE IF NOT EXISTS coupons (
      id SERIAL PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
      discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
      min_order_amount NUMERIC(10, 2) DEFAULT 0.00,
      max_discount_amount NUMERIC(10, 2),
      usage_limit INT DEFAULT 1000,
      times_used INT DEFAULT 0,
      active BOOLEAN DEFAULT TRUE,
      expires_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wishlists (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      product_id INT REFERENCES products(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, product_id)
    );

    ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50);
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) DEFAULT 0.00;

    CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
    CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);
  `);

  // 2. Insert initial coupons
  await db.query(`
    INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount_amount, active)
    VALUES 
      ('TECHFIX10', 'percentage', 10.00, 1000.00, 2500.00, true),
      ('WELCOME500', 'fixed', 500.00, 3000.00, 500.00, true),
      ('GAMING15', 'percentage', 15.00, 5000.00, 4000.00, true),
      ('SUPERSAVE', 'fixed', 1000.00, 10000.00, 1000.00, true)
    ON CONFLICT (code) DO NOTHING;
  `);

  console.log('Migration completed successfully!');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
