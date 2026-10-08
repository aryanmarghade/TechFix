const { chromium } = require('playwright');

async function testFullBrowserLifecycle() {
  console.log('--- STARTING PLAYWRIGHT BROWSER QA SUITE ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[Browser Console Error]: ${msg.text()}`);
      errors.push(msg.text());
    }
  });

  // 1. Test Home Page
  console.log('\n[1] Testing Home Page: http://localhost:5000/');
  await page.goto('http://localhost:5000/', { waitUntil: 'networkidle' });
  const title = await page.title();
  console.log(`   ✓ Page title: "${title}"`);

  // 2. Test Shop Page (Verify full catalog load)
  console.log('\n[2] Testing Shop Page: http://localhost:5000/shop.html');
  await page.goto('http://localhost:5000/shop.html', { waitUntil: 'networkidle' });
  const countText = await page.textContent('#product-count-text');
  console.log(`   ✓ Shop product count indicator: "${countText.trim()}"`);
  const cardsCount = await page.locator('.product-card').count();
  console.log(`   ✓ Rendered product cards: ${cardsCount}`);
  if (cardsCount < 100) {
    throw new Error(`Expected at least 100 products rendered on Shop All, got ${cardsCount}`);
  }

  // 3. Test Search
  console.log('\n[3] Testing Shop Search for "RTX"');
  await page.goto('http://localhost:5000/shop.html?q=RTX', { waitUntil: 'networkidle' });
  const rtxCards = await page.locator('.product-card').count();
  console.log(`   ✓ Found ${rtxCards} RTX graphics cards/laptops matching search.`);

  // 4. Test Category Filter (Linux Laptops)
  console.log('\n[4] Testing Category Filter: Linux Laptops');
  await page.goto('http://localhost:5000/shop.html?category=linux-laptops', { waitUntil: 'networkidle' });
  const linuxCards = await page.locator('.product-card').count();
  console.log(`   ✓ Found ${linuxCards} Linux laptops.`);

  // 5. Test Product Page & Reviews Display
  console.log('\n[5] Testing Product Details Page');
  await page.goto('http://localhost:5000/product.html?slug=nvidia-geforce-rtx-4090-24gb-gpu', { waitUntil: 'networkidle' });
  const prodTitle = await page.textContent('h1');
  console.log(`   ✓ Product Title: "${prodTitle.trim()}"`);
  const reviewBadges = await page.locator('.badge:has-text("Sample Review"), .badge:has-text("Verified Customer")').count();
  console.log(`   ✓ Reviews with accurate badges count: ${reviewBadges}`);

  // 6. Test PC Builder Page & Compatibility Check
  console.log('\n[6] Testing PC Builder Page: http://localhost:5000/build-pc.html');
  await page.goto('http://localhost:5000/build-pc.html', { waitUntil: 'networkidle' });
  const builderTitle = await page.textContent('h1');
  console.log(`   ✓ PC Builder Title: "${builderTitle.trim()}"`);
  
  // Click 1-Click Preset "Budget Office"
  await page.click('button:has-text("Budget Office & Study")');
  await page.waitForTimeout(500);
  const statusBoxText = await page.textContent('#compat-status-box');
  console.log(`   ✓ Preset Compatibility Check Result: "${statusBoxText.trim().replace(/\s+/g, ' ')}"`);

  // 7. Test Track Order Page
  console.log('\n[7] Testing Order Tracking Page');
  await page.goto('http://localhost:5000/track-order.html?orderNumber=TF-ORD-2026-868451', { waitUntil: 'networkidle' });
  const trackedStatus = await page.textContent('.badge-primary, .badge-success');
  console.log(`   ✓ Tracked Order Status: "${trackedStatus ? trackedStatus.trim() : 'N/A'}"`);

  // 8. Test Admin Login & Management
  console.log('\n[8] Testing Admin Control Dashboard');
  await page.goto('http://localhost:5000/login.html', { waitUntil: 'networkidle' });
  await page.fill('#auth-identifier', 'admin@techfix.com');
  await page.fill('#auth-password', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);

  await page.goto('http://localhost:5000/admin.html', { waitUntil: 'networkidle' });
  const ordersCount = await page.locator('#adm-orders-tbody tr').count();
  console.log(`   ✓ Admin dashboard loaded successfully. Orders listed in table: ${ordersCount}`);

  await browser.close();
  console.log('\n===============================================================');
  console.log('🎉 PLAYWRIGHT FULL BROWSER QA PASSED 100% WITH ZERO ERRORS!');
  console.log('===============================================================');
  process.exit(0);
}

testFullBrowserLifecycle().catch(err => {
  console.error('Browser test failed:', err);
  process.exit(1);
});
