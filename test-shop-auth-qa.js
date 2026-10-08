const { chromium } = require('playwright');

async function testShopAndAuthQA() {
  console.log('=== STARTING TECHFIX SHOP & AUTH QA SUITE ===\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log(`[Console Error]: ${msg.text()}`);
    }
  });

  // TEST 1: Shop Filter Switching
  console.log('[TEST 1] Testing Shop Filter Switching...');
  await page.goto('http://localhost:5000/shop.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const initialCountText = await page.textContent('#product-count-text');
  console.log(`  1. All Products: ${initialCountText.trim()}`);

  // Switch to Laptops
  await page.click('input[name="cat"][value="laptops"]');
  await page.waitForTimeout(500);
  const laptopCards = await page.locator('.product-card').count();
  const laptopCountText = await page.textContent('#product-count-text');
  console.log(`  2. Switched to Laptops: ${laptopCountText.trim()} (Cards: ${laptopCards})`);
  if (laptopCards === 0) throw new Error('Expected laptop products');

  // Switch from Laptops to Linux Laptops (Verify stale filter replaced)
  await page.click('input[name="cat"][value="linux-laptops"]');
  await page.waitForTimeout(500);
  const linuxCards = await page.locator('.product-card').count();
  const linuxCountText = await page.textContent('#product-count-text');
  console.log(`  3. Switched to Linux Laptops: ${linuxCountText.trim()} (Cards: ${linuxCards})`);
  if (linuxCards === 0) throw new Error('Expected Linux laptop products');
  if (linuxCards >= laptopCards) throw new Error('Linux Laptops count should be distinct subset from All Laptops');

  // Switch to SSDs
  await page.click('input[name="cat"][value="internal-ssds"]');
  await page.waitForTimeout(500);
  const ssdCards = await page.locator('.product-card').count();
  console.log(`  4. Switched to Internal SSDs: Cards = ${ssdCards}`);

  // Switch to Gaming Mice (Accessories)
  await page.click('input[name="cat"][value="gaming-mouse"]');
  await page.waitForTimeout(500);
  const mouseCards = await page.locator('.product-card').count();
  console.log(`  5. Switched to Gaming Mice: Cards = ${mouseCards}`);

  // Switch to Pre-Built PCs
  await page.click('input[name="cat"][value="pre-built-pcs"]');
  await page.waitForTimeout(500);
  const pcCards = await page.locator('.product-card').count();
  console.log(`  6. Switched to Pre-Built PCs: Cards = ${pcCards}`);

  // Switch back to Laptops
  await page.click('input[name="cat"][value="laptops"]');
  await page.waitForTimeout(500);
  const reLaptopCards = await page.locator('.product-card').count();
  console.log(`  7. Switched back to Laptops: Cards = ${reLaptopCards}`);
  if (reLaptopCards !== laptopCards) throw new Error('Laptops count mismatch on re-switch');

  // Reset Filters
  await page.click('button:has-text("Reset")');
  await page.waitForTimeout(500);
  const resetCards = await page.locator('.product-card').count();
  console.log(`  8. Reset Filters: Cards = ${resetCards}`);
  if (resetCards < 100) throw new Error('Reset filters did not restore full catalog');

  // TEST 2: Product Search Bar
  console.log('\n[TEST 2] Testing Product Search Bar...');
  // Search RTX
  await page.fill('#shop-search-input', 'RTX 3050');
  await page.click('#shop-search-btn');
  await page.waitForTimeout(500);
  let searchCards = await page.locator('.product-card').count();
  console.log(`  1. Search "RTX 3050": ${searchCards} products found`);
  if (searchCards === 0) throw new Error('Expected products for RTX 3050');

  // Search SSD + Category Filter
  await page.fill('#shop-search-input', 'Kingston');
  await page.press('#shop-search-input', 'Enter');
  await page.waitForTimeout(500);
  let kingstonCards = await page.locator('.product-card').count();
  console.log(`  2. Search "Kingston": ${kingstonCards} products found`);

  await page.click('input[name="cat"][value="internal-ssds"]');
  await page.waitForTimeout(500);
  let kingstonSsdCards = await page.locator('.product-card').count();
  console.log(`  3. Search "Kingston" + Category "Internal SSDs": ${kingstonSsdCards} products found`);

  // Clear search
  await page.click('#shop-search-clear');
  await page.waitForTimeout(500);
  let afterClearCards = await page.locator('.product-card').count();
  console.log(`  4. Cleared search (category still Internal SSDs): ${afterClearCards} products found`);
  if (afterClearCards !== ssdCards) throw new Error('Clearing search did not preserve active category filter correctly');

  // Reset all
  await page.click('button:has-text("Reset")');
  await page.waitForTimeout(500);

  // TEST 3: Logged-Out Checkout Block & Auth Popup
  console.log('\n[TEST 3] Testing Logged-Out Checkout Auth Modal & Protection...');
  // Clear any existing localStorage user / cart
  await page.evaluate(() => {
    localStorage.removeItem('techfix_user');
    localStorage.removeItem('techfix_token');
    localStorage.removeItem('techfix_cart');
  });

  // Add 1 product to cart from shop
  const firstAddBtn = page.locator('.product-card button:has-text("Add to Cart")').first();
  await firstAddBtn.click();
  await page.waitForTimeout(300);

  // Navigate to Cart then Checkout
  await page.goto('http://localhost:5000/cart.html', { waitUntil: 'networkidle' });
  const cartItemsCount = await page.locator('#cart-items-tbody tr').count();
  console.log(`  1. Cart page opened: ${cartItemsCount} item in cart.`);
  if (cartItemsCount === 0) throw new Error('Cart should have 1 item');

  await page.goto('http://localhost:5000/checkout.html', { waitUntil: 'networkidle' });

  // Fill in shipping details as guest
  await page.fill('#cust-name', 'Guest Test User');
  await page.fill('#cust-phone', '9876543210');
  await page.fill('#cust-email', 'guest@example.com');
  await page.fill('#addr-line1', 'Flat 402, Sea View');
  await page.fill('#addr-area', 'Bandra West');
  await page.fill('#addr-pincode', '400050');

  // Click Place COD Order Now
  console.log('  2. Guest clicking "Place COD Order Now"...');
  await page.click('#submit-order-btn');
  await page.waitForTimeout(500);

  // Verify Auth Modal is visible
  const modalDisplay = await page.evaluate(() => {
    const m = document.getElementById('auth-required-modal');
    return m ? window.getComputedStyle(m).display : 'none';
  });
  console.log(`  3. Auth Required Modal display: "${modalDisplay}"`);
  if (modalDisplay !== 'flex' && modalDisplay !== 'block') {
    throw new Error(`Expected auth modal to be displayed, got: ${modalDisplay}`);
  }

  // Verify Cart is still preserved
  const preservedCart = await page.evaluate(() => localStorage.getItem('techfix_cart'));
  console.log(`  4. Preserved Cart in localStorage: ${preservedCart ? 'INTACT' : 'MISSING'}`);
  if (!preservedCart || JSON.parse(preservedCart).length === 0) throw new Error('Cart was lost');

  // TEST 4: Security Backend Verification (Direct Unauthenticated POST)
  console.log('\n[TEST 4] Testing Backend Direct Order API without Auth Token...');
  const backendCheck = await page.evaluate(async () => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: 'Hacker Guest',
        customer_phone: '9999999999',
        customer_email: 'hacker@example.com',
        shipping_address: '123 Fake Street',
        city: 'Mumbai',
        pincode: '400001',
        items: [{ product_id: 1, quantity: 1 }]
      })
    });
    const data = await res.json();
    return { status: res.status, data };
  });
  console.log(`  1. Direct unauthenticated POST /api/orders status: ${backendCheck.status}`);
  console.log(`  2. Response: ${JSON.stringify(backendCheck.data)}`);
  if (backendCheck.status !== 401) {
    throw new Error(`Expected 401 Unauthorized for unauthenticated order creation, got: ${backendCheck.status}`);
  }

  // TEST 5: Sign In from Modal and Complete Checkout
  console.log('\n[TEST 5] Testing Login Flow with Cart Retention and COD Order Placement...');
  // Click Sign In link from modal
  await page.click('#auth-required-modal a[href*="/login.html"]');
  await page.waitForTimeout(500);
  console.log(`  1. Navigated to Login page URL: ${page.url()}`);

  // Perform login
  await page.fill('#login-identifier', 'aryan@example.com');
  await page.fill('#login-password', 'customer123');
  await page.click('#login-btn');
  await page.waitForTimeout(1500);

  console.log(`  2. Redirected back after login to URL: ${page.url()}`);
  if (!page.url().includes('checkout.html')) {
    await page.goto('http://localhost:5000/checkout.html', { waitUntil: 'networkidle' });
  }

  // Fill in address details and submit COD order
  await page.fill('#cust-name', 'Aryan Sharma');
  await page.fill('#cust-phone', '9820112233');
  await page.fill('#cust-email', 'aryan@example.com');
  await page.fill('#addr-line1', 'Tower 5, Palm Beach Rd');
  await page.fill('#addr-area', 'Navi Mumbai');
  await page.fill('#addr-pincode', '400703');

  await page.click('#submit-order-btn');
  await page.waitForTimeout(2000);

  console.log(`  3. Order Submission URL: ${page.url()}`);
  if (!page.url().includes('order-confirmation.html')) {
    throw new Error('Expected redirection to order-confirmation.html');
  }

  const confText = await page.textContent('h1, h2');
  console.log(`  4. Confirmation page header: "${confText.trim()}"`);

  // TEST 6: Check Admin Dashboard for the New Order
  console.log('\n[TEST 6] Testing Admin Dashboard Order Visibility...');
  await page.evaluate(() => {
    localStorage.removeItem('techfix_user');
    localStorage.removeItem('techfix_token');
  });

  await page.goto('http://localhost:5000/login.html', { waitUntil: 'networkidle' });
  await page.fill('#login-identifier', 'admin@techfix.com');
  await page.fill('#login-password', 'admin123');
  await page.click('#login-btn');
  await page.waitForTimeout(1000);

  await page.goto('http://localhost:5000/admin.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const firstAdminOrder = await page.textContent('#adm-orders-tbody tr:first-child');
  console.log(`  ✓ Latest Order in Admin: "${firstAdminOrder.trim().replace(/\s+/g, ' ')}"`);

  await browser.close();
  console.log('\n======================================================');
  console.log('🎉 ALL SHOP FILTERS, SEARCH & AUTH CHECKS PASSED 100%!');
  console.log('======================================================');
}

testShopAndAuthQA().catch(err => {
  console.error('QA Test Failure:', err);
  process.exit(1);
});
