const { chromium } = require('playwright');
const db = require('./server/db');

async function runBrowserE2EQA() {
  console.log('===============================================================');
  console.log('🚀 RUNNING 100% REAL BROWSER UI PLAYWRIGHT TEST SUITE');
  console.log('===============================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log(`[Browser Console Error]: ${msg.text()}`);
    }
  });

  // -------------------------------------------------------------
  // 1. SHOP FILTER UI TESTS
  // -------------------------------------------------------------
  console.log('--- 1. SHOP FILTER UI TESTS ---');
  await page.goto('http://localhost:5000/shop.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Step 1: All Products
  let countText = await page.textContent('#product-count-text');
  let cards = await page.locator('.product-card').count();
  console.log(`[UI Filter] 1. All Products: "${countText.trim()}", cards = ${cards}`);
  if (cards < 100) throw new Error(`Expected >100 products for All Products, got ${cards}`);

  // Step 2: Click Laptops
  await page.click('input[name="cat"][value="laptops"]');
  await page.waitForTimeout(600);
  countText = await page.textContent('#product-count-text');
  cards = await page.locator('.product-card').count();
  let url = page.url();
  console.log(`[UI Filter] 2. Laptops: "${countText.trim()}", cards = ${cards}, URL = ${url}`);
  if (cards !== 15 || !url.includes('category=laptops')) {
    throw new Error(`Expected 15 laptop cards, got ${cards}, URL: ${url}`);
  }

  // Step 3: Click Linux Laptops (Verify Laptops filter replaced completely)
  await page.click('input[name="cat"][value="linux-laptops"]');
  await page.waitForTimeout(600);
  countText = await page.textContent('#product-count-text');
  cards = await page.locator('.product-card').count();
  url = page.url();
  console.log(`[UI Filter] 3. Linux Laptops: "${countText.trim()}", cards = ${cards}, URL = ${url}`);
  if (cards !== 5 || !url.includes('category=linux-laptops')) {
    throw new Error(`Expected 5 Linux laptop cards, got ${cards}, URL: ${url}`);
  }

  // Step 4: Click Internal SSDs
  await page.click('input[name="cat"][value="internal-ssds"]');
  await page.waitForTimeout(600);
  countText = await page.textContent('#product-count-text');
  cards = await page.locator('.product-card').count();
  url = page.url();
  console.log(`[UI Filter] 4. Internal SSDs: "${countText.trim()}", cards = ${cards}, URL = ${url}`);
  if (cards !== 15 || !url.includes('category=internal-ssds')) {
    throw new Error(`Expected 15 SSD cards, got ${cards}, URL: ${url}`);
  }

  // Step 5: Click Gaming Mice
  await page.click('input[name="cat"][value="gaming-mouse"]');
  await page.waitForTimeout(600);
  countText = await page.textContent('#product-count-text');
  cards = await page.locator('.product-card').count();
  url = page.url();
  console.log(`[UI Filter] 5. Gaming Mice: "${countText.trim()}", cards = ${cards}, URL = ${url}`);
  if (cards !== 4 || !url.includes('category=gaming-mouse')) {
    throw new Error(`Expected 4 gaming mice cards, got ${cards}, URL: ${url}`);
  }

  // Step 6: Click Pre-Built PCs
  await page.click('input[name="cat"][value="pre-built-pcs"]');
  await page.waitForTimeout(600);
  countText = await page.textContent('#product-count-text');
  cards = await page.locator('.product-card').count();
  url = page.url();
  console.log(`[UI Filter] 6. Pre-Built PCs: "${countText.trim()}", cards = ${cards}, URL = ${url}`);
  if (cards !== 12 || !url.includes('category=pre-built-pcs')) {
    throw new Error(`Expected 12 PC cards, got ${cards}, URL: ${url}`);
  }

  // Step 7: Switch back to Laptops
  await page.click('input[name="cat"][value="laptops"]');
  await page.waitForTimeout(600);
  cards = await page.locator('.product-card').count();
  console.log(`[UI Filter] 7. Laptops again: cards = ${cards}`);
  if (cards !== 15) throw new Error(`Expected 15 laptop cards on re-switch, got ${cards}`);

  // Step 8: Click Reset All
  await page.click('button:has-text("Reset")');
  await page.waitForTimeout(600);
  cards = await page.locator('.product-card').count();
  console.log(`[UI Filter] 8. All Products (Reset): cards = ${cards}`);
  if (cards < 100) throw new Error(`Expected >100 cards after reset, got ${cards}`);
  console.log('✅ Filter UI Sequences PASSED!\n');

  // -------------------------------------------------------------
  // 2. REAL SEARCH UI
  // -------------------------------------------------------------
  console.log('--- 2. REAL SEARCH UI TESTS ---');
  // Search RTX 3050 with Enter key
  await page.fill('#shop-search-input', 'RTX 3050');
  await page.press('#shop-search-input', 'Enter');
  await page.waitForTimeout(600);
  cards = await page.locator('.product-card').count();
  console.log(`[UI Search] Search "RTX 3050" (Enter key): ${cards} cards displayed`);
  if (cards === 0) throw new Error('Expected results for RTX 3050');

  // Search Kingston SSD with Search Button
  await page.fill('#shop-search-input', 'Kingston');
  await page.click('#shop-search-btn');
  await page.waitForTimeout(600);
  cards = await page.locator('.product-card').count();
  console.log(`[UI Search] Search "Kingston" (Search button): ${cards} cards displayed`);
  if (cards === 0) throw new Error('Expected results for Kingston');

  // Search No Results
  await page.fill('#shop-search-input', 'XYZNonExistentKeyword999');
  await page.click('#shop-search-btn');
  await page.waitForTimeout(600);
  cards = await page.locator('.product-card').count();
  const emptyState = await page.locator('h3:has-text("No matching products found")').count();
  console.log(`[UI Search] Search with no results: cards = ${cards}, emptyState = ${emptyState}`);
  if (cards !== 0 || emptyState !== 1) throw new Error('Expected empty state UI for no-match search');

  // Clear X button
  await page.click('#shop-search-clear');
  await page.waitForTimeout(600);
  cards = await page.locator('.product-card').count();
  console.log(`[UI Search] After Clear X button: cards = ${cards}`);
  if (cards < 100) throw new Error('Expected full catalog restored after clear');

  // Search + Filter Combined
  await page.fill('#shop-search-input', 'Kingston');
  await page.press('#shop-search-input', 'Enter');
  await page.waitForTimeout(600);
  await page.click('input[name="cat"][value="internal-ssds"]');
  await page.waitForTimeout(600);
  cards = await page.locator('.product-card').count();
  const cardTitle = await page.textContent('.product-card .product-title');
  console.log(`[UI Search+Filter] Search "Kingston" + Category "Internal SSDs": cards = ${cards}, Title: "${cardTitle.trim()}"`);
  if (cards === 0 || !cardTitle.toLowerCase().includes('kingston')) {
    throw new Error('Expected matching Kingston SSD card');
  }
  console.log('✅ Real Search UI PASSED!\n');

  // -------------------------------------------------------------
  // 3. SEARCH + FILTER SWITCHING SEQUENCE
  // -------------------------------------------------------------
  console.log('--- 3. SEARCH + FILTER SWITCHING SEQUENCE ---');
  // 1. Search = SSD, Category = Internal SSDs
  await page.fill('#shop-search-input', 'SSD');
  await page.press('#shop-search-input', 'Enter');
  await page.waitForTimeout(500);
  await page.click('input[name="cat"][value="internal-ssds"]');
  await page.waitForTimeout(500);
  let s1Cards = await page.locator('.product-card').count();
  console.log(`  Step 1 (Search=SSD, Cat=internal-ssds): cards = ${s1Cards}`);

  // 2. Category = Linux Laptops (Preserve search=SSD)
  await page.click('input[name="cat"][value="linux-laptops"]');
  await page.waitForTimeout(500);
  let s2Cards = await page.locator('.product-card').count();
  console.log(`  Step 2 (Cat=linux-laptops, Search=SSD): cards = ${s2Cards}`);

  // 3. Search = Linux
  await page.fill('#shop-search-input', 'Linux');
  await page.press('#shop-search-input', 'Enter');
  await page.waitForTimeout(500);
  let s3Cards = await page.locator('.product-card').count();
  console.log(`  Step 3 (Search=Linux, Cat=linux-laptops): cards = ${s3Cards}`);
  if (s3Cards !== 5) throw new Error(`Expected 5 Linux laptops for Linux search, got ${s3Cards}`);

  // 4. Clear Search
  await page.click('#shop-search-clear');
  await page.waitForTimeout(500);
  let s4Cards = await page.locator('.product-card').count();
  console.log(`  Step 4 (Clear search, Cat=linux-laptops): cards = ${s4Cards}`);
  if (s4Cards !== 5) throw new Error('Expected 5 cards on clear search');

  // 5. Category = Laptops
  await page.click('input[name="cat"][value="laptops"]');
  await page.waitForTimeout(500);
  let s5Cards = await page.locator('.product-card').count();
  console.log(`  Step 5 (Cat=laptops): cards = ${s5Cards}`);
  if (s5Cards !== 15) throw new Error('Expected 15 laptop cards');

  // 6. Clear Filters
  await page.click('button:has-text("Reset")');
  await page.waitForTimeout(500);
  let s6Cards = await page.locator('.product-card').count();
  console.log(`  Step 6 (Clear Filters): cards = ${s6Cards}`);
  if (s6Cards < 100) throw new Error('Expected >100 cards after full reset');
  console.log('✅ Search + Filter Switching Sequence PASSED!\n');

  // -------------------------------------------------------------
  // 4. GUEST CHECKOUT MODAL & BACKEND PROTECTION
  // -------------------------------------------------------------
  console.log('--- 4. GUEST CHECKOUT & MODAL PROTECTION ---');
  // Start with clean state
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // Open shop, add 1 item to cart
  await page.goto('http://localhost:5000/shop.html', { waitUntil: 'networkidle' });
  await page.locator('.product-card button:has-text("Add to Cart")').first().click();
  await page.waitForTimeout(400);

  // Navigate Cart -> Checkout
  await page.goto('http://localhost:5000/cart.html', { waitUntil: 'networkidle' });
  await page.goto('http://localhost:5000/checkout.html', { waitUntil: 'networkidle' });

  // Fill details as guest
  await page.fill('#cust-name', 'Guest Buyer');
  await page.fill('#cust-phone', '9876543210');
  await page.fill('#cust-email', 'guestbuyer@example.com');
  await page.fill('#addr-line1', 'Apartment 101, Marine Drive');
  await page.fill('#addr-area', 'Churchgate');
  await page.fill('#addr-pincode', '400020');

  // Record order count in DB before attempt
  const beforeOrders = await db.query('SELECT count(*) FROM orders');
  const countBefore = parseInt(beforeOrders.rows[0].count, 10);

  // Click Place Order as Guest
  console.log('  Guest clicking "Place COD Order Now"...');
  await page.click('#submit-order-btn');
  await page.waitForTimeout(500);

  // Verify modal visibility
  const modalVisible = await page.evaluate(() => {
    const el = document.getElementById('auth-required-modal');
    return el && window.getComputedStyle(el).display !== 'none';
  });
  console.log(`  Modal Visible: ${modalVisible}`);
  if (!modalVisible) throw new Error('Expected #auth-required-modal to be visible');

  // Verify 0 orders created in DB
  const afterOrders = await db.query('SELECT count(*) FROM orders');
  const countAfter = parseInt(afterOrders.rows[0].count, 10);
  console.log(`  DB Orders: Before = ${countBefore}, After = ${countAfter}`);
  if (countBefore !== countAfter) throw new Error('Database order was created for guest attempt!');
  console.log('✅ Guest Checkout Block & Auth Modal PASSED!\n');

  // -------------------------------------------------------------
  // 5. SIGN IN REDIRECT & COD ORDER PLACEMENT
  // -------------------------------------------------------------
  console.log('--- 5. SIGN IN REDIRECT & COD ORDER PLACEMENT ---');
  // Click Sign In button from modal
  await page.click('#auth-required-modal a[href*="/login.html"]');
  await page.waitForTimeout(800);
  console.log(`  Redirected to Login: ${page.url()}`);
  if (!page.url().includes('login.html?redirect=/checkout.html')) {
    throw new Error('Login redirect URL missing ?redirect=/checkout.html');
  }

  // Sign in as existing customer
  await page.fill('#login-identifier', 'aryan@example.com');
  await page.fill('#login-password', 'customer123');
  await page.click('#login-btn');
  await page.waitForTimeout(1500);

  console.log(`  After login redirected back to: ${page.url()}`);
  if (!page.url().includes('checkout.html')) {
    throw new Error('Expected auto-redirect back to /checkout.html after login');
  }

  // Verify cart intact
  const cartSummaryItems = await page.locator('#checkout-items-list > div').count();
  console.log(`  Cart items in checkout summary: ${cartSummaryItems}`);
  if (cartSummaryItems === 0) throw new Error('Cart was lost during login redirect');

  // Fill in shipping information
  await page.fill('#cust-name', 'Aryan Sharma');
  await page.fill('#cust-phone', '9820112233');
  await page.fill('#cust-email', 'aryan@example.com');
  await page.fill('#addr-line1', 'Flat 502, Palm Beach');
  await page.fill('#addr-area', 'Vashi');
  await page.fill('#addr-pincode', '400703');

  // Place COD Order
  await page.click('#submit-order-btn');
  await page.waitForTimeout(2000);

  console.log(`  Order confirmation URL: ${page.url()}`);
  if (!page.url().includes('order-confirmation.html')) {
    throw new Error('Failed to reach order-confirmation.html');
  }
  console.log('✅ Sign In Redirect & COD Order Placement PASSED!\n');

  // -------------------------------------------------------------
  // 6. REGISTER REDIRECT & ORDER
  // -------------------------------------------------------------
  console.log('--- 6. REGISTER REDIRECT & ORDER ---');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  await page.goto('http://localhost:5000/shop.html', { waitUntil: 'networkidle' });
  await page.locator('.product-card button:has-text("Add to Cart")').first().click();
  await page.waitForTimeout(300);

  await page.goto('http://localhost:5000/checkout.html', { waitUntil: 'networkidle' });
  // Fill required checkout fields so form validation passes and triggers auth modal
  await page.fill('#cust-name', 'New Guest');
  await page.fill('#cust-phone', '9820001122');
  await page.fill('#cust-email', 'newguest@example.com');
  await page.fill('#addr-line1', 'Street 5');
  await page.fill('#addr-area', 'Dadar');
  await page.fill('#addr-pincode', '400014');

  await page.click('#submit-order-btn');
  await page.waitForTimeout(500);

  // Click Register link from modal
  await page.click('#auth-required-modal a[href*="/register.html"]');
  await page.waitForTimeout(800);
  console.log(`  Redirected to Register: ${page.url()}`);

  const testEmail = `reg_test_${Date.now()}@example.com`;
  const testPhone = '98' + Math.floor(10000000 + Math.random() * 90000000);
  await page.fill('#reg-name', 'New Registered User');
  await page.fill('#reg-email', testEmail);
  await page.fill('#reg-phone', testPhone);
  await page.fill('#reg-password', 'password123');
  await page.fill('#reg-confirm-password', 'password123');
  await page.click('#reg-btn');
  await page.waitForTimeout(1500);

  console.log(`  After registration redirected to: ${page.url()}`);
  if (!page.url().includes('checkout.html')) {
    throw new Error('Expected auto-redirect back to /checkout.html after registration');
  }

  // Complete checkout
  await page.fill('#cust-name', 'New Registered User');
  await page.fill('#cust-phone', '9820998877');
  await page.fill('#cust-email', testEmail);
  await page.fill('#addr-line1', 'House 12, MG Road');
  await page.fill('#addr-area', 'Fort');
  await page.fill('#addr-pincode', '400001');
  await page.click('#submit-order-btn');
  await page.waitForTimeout(2000);
  console.log(`  Registered User Confirmation URL: ${page.url()}`);
  if (!page.url().includes('order-confirmation.html')) {
    throw new Error('Failed to reach order-confirmation.html for newly registered user');
  }
  console.log('✅ Register Redirect Flow PASSED!\n');

  // -------------------------------------------------------------
  // 7. BACKEND DIRECT UNATHENTICATED API SECURITY
  // -------------------------------------------------------------
  console.log('--- 7. BACKEND DIRECT UNAUTHENTICATED API SECURITY ---');
  // Log out completely so cookie and localStorage are empty
  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await fetch('/api/auth/logout', { method: 'POST' });
  });

  const directUnauth1 = await page.evaluate(async () => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        customer_name: 'Guest',
        customer_email: 'guest@example.com',
        customer_phone: '9820123456',
        shipping_address: 'Address 1',
        city: 'Mumbai',
        pincode: '400001',
        items: [{ product_id: 1, quantity: 1 }] 
      })
    });
    return res.status;
  });
  const directUnauth2 = await page.evaluate(async () => {
    const res = await fetch('/api/orders/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        customer_name: 'Guest',
        customer_email: 'guest@example.com',
        customer_phone: '9820123456',
        shipping_address: 'Address 1',
        city: 'Mumbai',
        pincode: '400001',
        items: [{ productId: 1, quantity: 1 }] 
      })
    });
    return res.status;
  });
  console.log(`  POST /api/orders status: ${directUnauth1} (Expected: 401)`);
  console.log(`  POST /api/orders/checkout status: ${directUnauth2} (Expected: 401)`);
  if (directUnauth1 !== 401 || directUnauth2 !== 401) {
    throw new Error('Backend endpoints did not reject unauthenticated orders with 401');
  }
  console.log('✅ Backend API Security PASSED!\n');

  // -------------------------------------------------------------
  // 8. DOUBLE-CLICK SUBMISSION PROTECTION
  // -------------------------------------------------------------
  console.log('--- 8. DOUBLE-CLICK SUBMISSION PROTECTION ---');
  // Log in as user first
  await page.goto('http://localhost:5000/login.html', { waitUntil: 'networkidle' });
  await page.fill('#login-identifier', 'aryan@example.com');
  await page.fill('#login-password', 'customer123');
  await page.click('#login-btn');
  await page.waitForTimeout(1000);

  await page.goto('http://localhost:5000/shop.html', { waitUntil: 'networkidle' });
  await page.locator('.product-card button:has-text("Add to Cart")').first().click();
  await page.waitForTimeout(300);

  await page.goto('http://localhost:5000/checkout.html', { waitUntil: 'networkidle' });
  await page.fill('#cust-name', 'Aryan Sharma');
  await page.fill('#cust-phone', '9820112233');
  await page.fill('#cust-email', 'aryan@example.com');
  await page.fill('#addr-line1', 'Flat 502, Palm Beach');
  await page.fill('#addr-area', 'Vashi');
  await page.fill('#addr-pincode', '400703');

  const ordersCountBeforeDbl = (await db.query('SELECT count(*) FROM orders')).rows[0].count;

  // Rapid double click
  const submitBtn = page.locator('#submit-order-btn');
  await Promise.all([
    submitBtn.click({ clickCount: 2 }),
    page.waitForTimeout(2000)
  ]);

  const ordersCountAfterDbl = (await db.query('SELECT count(*) FROM orders')).rows[0].count;
  const delta = parseInt(ordersCountAfterDbl, 10) - parseInt(ordersCountBeforeDbl, 10);
  console.log(`  Orders created during double-click: ${delta} (Expected exactly 1)`);
  if (delta !== 1) throw new Error(`Double click created ${delta} orders instead of 1`);
  console.log('✅ Double-Click Protection PASSED!\n');

  // -------------------------------------------------------------
  // 9. MOBILE VIEWPORT (390 x 844) UI TEST
  // -------------------------------------------------------------
  console.log('--- 9. MOBILE VIEWPORT (390 x 844) UI TESTS ---');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:5000/shop.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const searchBoxWidth = await page.locator('.shop-search-bar').boundingBox();
  console.log(`  Mobile search bar width: ${searchBoxWidth.width}px`);
  if (searchBoxWidth.width > 390) throw new Error('Search bar exceeds viewport width on mobile');

  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  console.log(`  Horizontal overflow on mobile: ${hasHorizontalScroll}`);
  if (hasHorizontalScroll) throw new Error('Mobile shop page has horizontal overflow');

  // Mobile Checkout & Modal
  await page.goto('http://localhost:5000/shop.html', { waitUntil: 'networkidle' });
  await page.locator('.product-card button:has-text("Add to Cart")').first().click();
  await page.waitForTimeout(300);

  await page.goto('http://localhost:5000/checkout.html', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.removeItem('techfix_user');
    localStorage.removeItem('techfix_token');
  });
  await page.fill('#cust-name', 'Mobile User');
  await page.fill('#cust-phone', '9820001122');
  await page.fill('#cust-email', 'mobile@example.com');
  await page.fill('#addr-line1', 'Street 5');
  await page.fill('#addr-area', 'Dadar');
  await page.fill('#addr-pincode', '400014');
  await page.click('#submit-order-btn');
  await page.waitForTimeout(500);
  const mobileModalBox = await page.locator('#auth-required-modal > div').boundingBox();
  console.log(`  Mobile modal box width: ${mobileModalBox.width}px`);
  if (mobileModalBox.width > 390) throw new Error('Modal exceeds mobile screen width');
  console.log('✅ Mobile Responsive UI PASSED!\n');

  // -------------------------------------------------------------
  // 10. ADMIN DASHBOARD & PRODUCT MANAGEMENT E2E
  // -------------------------------------------------------------
  console.log('--- 10. ADMIN DASHBOARD & PRODUCT MANAGEMENT E2E ---');
  await page.setViewportSize({ width: 1280, height: 800 });
  // Login as admin
  await page.goto('http://localhost:5000/login.html', { waitUntil: 'networkidle' });
  await page.fill('#login-identifier', 'admin@techfix.com');
  await page.fill('#login-password', 'admin123');
  await page.click('#login-btn');
  await page.waitForTimeout(1000);

  // Navigate to Admin Operations
  await page.goto('http://localhost:5000/admin.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const adminRevText = await page.textContent('#stat-revenue');
  const adminProdCount = await page.textContent('#stat-products');
  console.log(`  Admin Dashboard Loaded -> Revenue: ${adminRevText.trim()}, Products: ${adminProdCount.trim()}`);
  if (!adminRevText || !adminProdCount) throw new Error('Admin Dashboard failed to load metrics');

  // Switch to Products tab
  await page.click('.admin-menu-item:has-text("Product Management")');
  await page.waitForTimeout(500);

  // Search product in admin
  await page.fill('#adm-prod-search', 'RTX 3050');
  await page.waitForTimeout(400);
  const adminFilteredProds = await page.locator('#adm-products-tbody tr').count();
  console.log(`  Admin searched "RTX 3050": ${adminFilteredProds} rows found`);
  if (adminFilteredProds !== 2) throw new Error(`Expected 2 products for "RTX 3050" in admin, got ${adminFilteredProds}`);

  // Clear admin search & filter by category
  await page.fill('#adm-prod-search', '');
  await page.selectOption('#adm-prod-cat-filter', 'linux-laptops');
  await page.waitForTimeout(400);
  const adminLinuxCount = await page.locator('#adm-products-tbody tr').count();
  console.log(`  Admin filtered "Linux Laptops": ${adminLinuxCount} rows found`);
  if (adminLinuxCount !== 5) throw new Error(`Expected 5 Linux laptops in admin, got ${adminLinuxCount}`);

  // Reset admin filter
  await page.selectOption('#adm-prod-cat-filter', '');

  // Add new product via Admin Modal
  const testProdName = `Admin Test SSD ${Date.now()}`;
  const testProdSku = `SSD-ADM-${Date.now().toString().slice(-4)}`;
  await page.click('button:has-text("+ Add New Product")');
  await page.waitForTimeout(300);

  await page.selectOption('#prod-cat', '4'); // Internal SSDs (id 4)
  await page.fill('#prod-name', testProdName);
  await page.fill('#prod-brand', 'TechFix Labs');
  await page.fill('#prod-sku', testProdSku);
  await page.fill('#prod-price', '4599');
  await page.fill('#prod-stock', '15');
  await page.fill('#prod-short', 'High-speed PCIe 4.0 NVMe Solid State Drive');
  await page.click('#prod-submit-btn');
  await page.waitForTimeout(1500);

  // Verify in PostgreSQL database
  const checkDb = await db.query('SELECT * FROM products WHERE sku = $1', [testProdSku]);
  console.log(`  Newly added product in PostgreSQL: id = ${checkDb.rows[0]?.id}, name = "${checkDb.rows[0]?.name}"`);
  if (checkDb.rowCount === 0) throw new Error('New product was not created in PostgreSQL database');

  // Verify product is now visible in Public Shop UI
  await page.goto('http://localhost:5000/shop.html?category=internal-ssds', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const newProdInShop = await page.locator(`.product-card:has-text("${testProdName}")`).count();
  console.log(`  New product visible in public shop: ${newProdInShop === 1}`);
  if (newProdInShop !== 1) throw new Error('New admin product was not rendered in public shop');

  // Cleanup: Delete the test product via admin API safely
  await page.goto('http://localhost:5000/admin.html', { waitUntil: 'networkidle' });
  await page.evaluate(async (pid) => {
    const t = localStorage.getItem('techfix_token');
    await fetch(`/api/admin/products/${pid}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${t}` }
    });
  }, checkDb.rows[0].id);
  // -------------------------------------------------------------
  // 11. PC BUILDER COMPATIBILITY & PRESET E2E
  // -------------------------------------------------------------
  console.log('--- 11. PC BUILDER REAL BROWSER E2E ---');
  await page.goto('http://localhost:5000/build-pc.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Apply 1-Click Preset (Esports 1080p)
  await page.click('button:has-text("1080p Esports Gaming")');
  await page.waitForTimeout(1000);

  const compatBoxText = await page.textContent('#compat-status-box');
  const grandTotalText = await page.textContent('#build-grand-total');
  console.log(`  PC Builder Preset Applied -> Compatibility: "${compatBoxText.trim()}", Total: ${grandTotalText.trim()}`);
  if (!compatBoxText.includes('Compatible') && !compatBoxText.includes('✓')) {
    throw new Error('Esports preset did not validate as compatible in browser');
  }

  // Add build to cart
  await page.click('#add-build-cart-btn');
  await page.waitForTimeout(800);
  const cartItemCount = await page.locator('.cart-item').count();
  console.log(`  Cart items displayed: ${cartItemCount}`);
  if (cartItemCount === 0) throw new Error('Custom PC build was not added to cart');
  console.log('✅ PC Builder Real Browser E2E PASSED!\n');

  // -------------------------------------------------------------
  // 12. CUSTOMER DASHBOARD (ORDERS, WISHLIST, REPAIRS, INVOICE)
  // -------------------------------------------------------------
  console.log('--- 12. CUSTOMER DASHBOARD REAL BROWSER E2E ---');
  await page.goto('http://localhost:5000/account.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const accUser = await page.textContent('#acc-user-name');
  console.log(`  Customer Dashboard Loaded for user: ${accUser.trim()}`);

  // Switch to Wishlist Tab
  await page.click('.menu-item:has-text("My Wishlist")');
  await page.waitForTimeout(500);
  const wishlistActive = await page.locator('#pane-wishlist').isVisible();
  console.log(`  Wishlist Tab Active: ${wishlistActive}`);
  if (!wishlistActive) throw new Error('Wishlist tab failed to activate');

  // Switch to Repairs Tab
  await page.click('.menu-item:has-text("Repair Requests")');
  await page.waitForTimeout(500);
  const repairsActive = await page.locator('#pane-repairs').isVisible();
  console.log(`  Repairs Tab Active: ${repairsActive}`);
  if (!repairsActive) throw new Error('Repairs tab failed to activate');

  // Switch to Saved PC Builds Tab
  await page.click('.menu-item:has-text("Saved PC Builds")');
  await page.waitForTimeout(500);
  const buildsActive = await page.locator('#pane-builds').isVisible();
  console.log(`  Saved Builds Tab Active: ${buildsActive}`);
  if (!buildsActive) throw new Error('Saved builds tab failed to activate');
  console.log('✅ Customer Dashboard Real Browser E2E PASSED!\n');

  // -------------------------------------------------------------
  // 13. PRODUCT DETAIL PAGE (GALLERY, SPECS, REVIEWS, RECOMMENDATIONS)
  // -------------------------------------------------------------
  console.log('--- 13. PRODUCT DETAIL PAGE REAL BROWSER E2E ---');
  await page.goto('http://localhost:5000/shop.html?category=laptops', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.locator('a.btn-primary:has-text("Details")').first().click();
  await page.waitForTimeout(1000);

  const prodTitle = await page.textContent('h1');
  const specTableCount = await page.locator('.spec-table').count();
  const relatedCount = await page.locator('.product-card').count();
  console.log(`  Product Details Loaded: "${prodTitle.trim()}", Specs: ${specTableCount > 0}, Related items: ${relatedCount}`);
  if (!prodTitle || specTableCount === 0) throw new Error('Product detail page failed to render specs or title');
  console.log('✅ Product Detail Page Real Browser E2E PASSED!\n');

  // -------------------------------------------------------------
  // 14. OLLAMA AI ASSISTANT API & FALLBACK TEST
  // -------------------------------------------------------------
  console.log('--- 14. OLLAMA AI ASSISTANT & FALLBACK TEST ---');
  const chatStatusRes = await page.evaluate(async () => {
    const res = await fetch('/api/chat/status');
    return res.json();
  });
  console.log(`  AI Chat Service Status: Online = ${chatStatusRes.online}, Model = ${chatStatusRes.model}`);

  const chatMessageRes = await page.evaluate(async () => {
    const res = await fetch('/api/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Recommend an SSD for laptop upgrade' })
    });
    return res.json();
  });
  console.log(`  AI Chat Message Response Received (success: ${chatMessageRes.success}, hasReply: ${!!(chatMessageRes.reply || chatMessageRes.response)})`);
  if (!chatMessageRes.reply && !chatMessageRes.response) {
    throw new Error('Chat endpoint failed to return a response or graceful fallback');
  }
  console.log('✅ Ollama AI Assistant & Fallback PASSED!\n');

  await browser.close();
  console.log('===============================================================');
  console.log('🎉 ALL 14 REAL BROWSER UI PLAYWRIGHT TESTS PASSED 100%!');
  console.log('===============================================================');
  process.exit(0);
}

runBrowserE2EQA().catch(err => {
  console.error('Browser QA Error:', err);
  process.exit(1);
});

