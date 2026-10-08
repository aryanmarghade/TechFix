const fetch = globalThis.fetch;

async function runBrowserValidation() {
  console.log('--- RUNNING DETAILED VALIDATION SUITE ---');

  // 1. Unauthenticated checkout attempt on backend
  const unauthRes = await fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_name: 'Unauth User',
      customer_email: 'unauth@test.com',
      customer_phone: '9820000000',
      shipping_address: 'Mumbai',
      city: 'Mumbai',
      pincode: '400001',
      items: [{ product_id: 1, quantity: 1 }]
    })
  });
  console.log('[Security Test] Unauthenticated POST /api/orders status:', unauthRes.status, '(Expected: 401)');
  if (unauthRes.status !== 401) throw new Error('Unauthenticated order did not return 401');

  // 2. Shop filter switching backend consistency
  const allRes = await fetch('http://localhost:5000/api/products?limit=300').then(r => r.json());
  const laptopsRes = await fetch('http://localhost:5000/api/products?category=laptops&limit=300').then(r => r.json());
  const linuxLaptopsRes = await fetch('http://localhost:5000/api/products?category=linux-laptops&limit=300').then(r => r.json());
  const ssdsRes = await fetch('http://localhost:5000/api/products?category=internal-ssds&limit=300').then(r => r.json());
  const miceRes = await fetch('http://localhost:5000/api/products?category=gaming-mouse&limit=300').then(r => r.json());

  console.log('[Filter Test] Total Products:', allRes.data.length);
  console.log('[Filter Test] Laptops count:', laptopsRes.data.length);
  console.log('[Filter Test] Linux Laptops count:', linuxLaptopsRes.data.length);
  console.log('[Filter Test] Internal SSDs count:', ssdsRes.data.length);
  console.log('[Filter Test] Gaming Mice count:', miceRes.data.length);

  // Check no accidental overlap
  const laptopIds = new Set(laptopsRes.data.map(p => p.id));
  const linuxIds = new Set(linuxLaptopsRes.data.map(p => p.id));
  const ssdIds = new Set(ssdsRes.data.map(p => p.id));

  for (const id of linuxIds) {
    if (ssdIds.has(id)) throw new Error('Collision between Linux Laptops and SSDs');
  }

  // 3. Search test
  const searchRtx = await fetch('http://localhost:5000/api/products?search=RTX%203050').then(r => r.json());
  console.log('[Search Test] Search "RTX 3050" count:', searchRtx.data.length);
  if (searchRtx.data.length === 0) throw new Error('No products found for RTX 3050');

  const searchKingston = await fetch('http://localhost:5000/api/products?search=Kingston&category=internal-ssds').then(r => r.json());
  console.log('[Search+Filter Test] Search "Kingston" + Category "internal-ssds" count:', searchKingston.data.length);
  if (searchKingston.data.length === 0) throw new Error('No products found for Kingston SSD');

  // 4. Logged-in customer COD order
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'aryan@example.com', password: 'customer123' })
  }).then(r => r.json());

  const orderRes = await fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + loginRes.token
    },
    body: JSON.stringify({
      customer_name: 'Aryan Sharma',
      customer_email: 'aryan@example.com',
      customer_phone: '9820112233',
      shipping_address: 'Flat 302, Palm Beach Heights',
      city: 'Mumbai',
      pincode: '400703',
      items: [{ product_id: 1, quantity: 1 }]
    })
  });
  const orderData = await orderRes.json();
  console.log('[Order Placement Test] Status:', orderRes.status, 'Order Number:', orderData.order?.order_number);
  if (orderRes.status !== 201 || !orderData.success) throw new Error('Failed to place order');

  // 5. Track Order
  const trackRes = await fetch(`http://localhost:5000/api/orders/track/${orderData.order.order_number}`).then(r => r.json());
  console.log('[Tracking Test] Tracked Order:', trackRes.order?.order_number, 'Status:', trackRes.order?.order_status);
  if (!trackRes.success) throw new Error('Failed to track order');

  // 6. Admin visibility
  const adminLogin = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@techfix.com', password: 'admin123' })
  }).then(r => r.json());

  const adminOrders = await fetch('http://localhost:5000/api/admin/orders', {
    headers: { 'Authorization': 'Bearer ' + adminLogin.token }
  }).then(r => r.json());
  console.log('[Admin Test] Total Orders in Admin:', adminOrders.data?.length);
  const foundInAdmin = adminOrders.data?.some(o => o.order_number === orderData.order.order_number);
  console.log('[Admin Test] Created Order Visible in Admin:', foundInAdmin);
  if (!foundInAdmin) throw new Error('Order not visible in admin');

  console.log('\n--- ALL VERIFICATIONS PASSED SUCCESSFULLY! ---');
}

runBrowserValidation().catch(e => {
  console.error('Validation error:', e);
  process.exit(1);
});
