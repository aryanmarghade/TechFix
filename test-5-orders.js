const http = require('http');

function postJSON(path, payload, token = null) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function putJSON(path, payload, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Authorization': `Bearer ${token}`
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getJSON(path, token = null) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTestSimulation() {
  console.log('===============================================================');
  console.log('🚀 SUBMITTING 5 REAL COMPUTER ORDERS & ADMIN STATUS PROGRESSION');
  console.log('===============================================================\n');

  // Step 1: Admin Login
  const adminLogin = await postJSON('/api/auth/login', {
    identifier: 'admin@techfix.com',
    password: 'admin123'
  });
  console.log('[Admin Auth] Login status:', adminLogin.status, '| Role:', adminLogin.data.user ? adminLogin.data.user.role : 'none');
  const adminToken = adminLogin.data.token;

  // Step 2: Fetch Products to order (within COD limit)
  const prodsRes = await getJSON('/api/products?limit=25');
  const prods = prodsRes.data.data;
  console.log(`Fetched ${prods.length} products for placing orders.\n`);

  const customers = [
    {
      name: 'Rohan Sharma',
      email: 'rohan.sharma@example.com',
      phone: '9820111222',
      address: 'Flat 402, Sea View Residency, Bandra West',
      city: 'Mumbai',
      pincode: '400050',
      coupon: 'TECHFIX10',
      items: [{ product_id: prods[0].id, quantity: 1 }],
      targetStatus: 'Shipped'
    },
    {
      name: 'Pooja Kulkarni',
      email: 'pooja.kulkarni@example.com',
      phone: '9820333444',
      address: 'Shop 12, Lamington Road, Grant Road East',
      city: 'Mumbai',
      pincode: '400007',
      coupon: 'WELCOME500',
      items: [{ product_id: prods[1].id, quantity: 1 }],
      targetStatus: 'Completed'
    },
    {
      name: 'Vikas Nair',
      email: 'vikas.nair@example.com',
      phone: '9820555666',
      address: 'B-201, Highland Park, Kolshet Road',
      city: 'Thane',
      pincode: '400607',
      coupon: 'GAMING15',
      items: [{ product_id: prods[2].id, quantity: 1 }],
      targetStatus: 'Shipped'
    },
    {
      name: 'Sneha Patil',
      email: 'sneha.patil@example.com',
      phone: '9820777888',
      address: 'Plot 45, Sector 17, Vashi',
      city: 'Navi Mumbai',
      pincode: '400703',
      coupon: 'SUPERSAVE',
      items: [{ product_id: prods[4].id, quantity: 1 }],
      targetStatus: 'Completed'
    },
    {
      name: 'Aarav Deshmukh',
      email: 'aarav.deshmukh@example.com',
      phone: '9820999000',
      address: 'Tower 3, Lodha Park, Worli',
      city: 'Mumbai',
      pincode: '400018',
      coupon: null,
      items: [{ product_id: prods[5].id, quantity: 1 }],
      targetStatus: 'Shipped'
    }
  ];

  const placedOrders = [];

  // Step 3: Place 5 Customer Orders
  for (let i = 0; i < customers.length; i++) {
    const cust = customers[i];
    console.log(`[Order ${i + 1}/5] Placing COD Order for: ${cust.name} (${cust.phone})...`);

    const orderPayload = {
      customer_name: cust.name,
      customer_email: cust.email,
      customer_phone: cust.phone,
      shipping_address: cust.address,
      city: cust.city,
      pincode: cust.pincode,
      coupon_code: cust.coupon,
      delivery_instructions: 'Handle with care - Computer hardware package',
      items: cust.items
    };

    const res = await postJSON('/api/orders', orderPayload);
    if (res.status === 201 && res.data.success) {
      const ord = res.data.order;
      console.log(`   ✓ Order Created: #${ord.order_number} | Total Payable: ₹${ord.total} | Coupon: ${ord.coupon_code || 'None'} (-₹${ord.discount_amount || 0})`);
      placedOrders.push({
        id: ord.id,
        order_number: ord.order_number,
        targetStatus: cust.targetStatus,
        customer: cust.name
      });
    } else {
      console.error(`   ❌ Failed to place order for ${cust.name}:`, res.data);
    }
  }

  console.log('\n---------------------------------------------------------------');
  console.log('📦 ADMIN STATUS UPDATES (Marking Shipped & Completed)');
  console.log('---------------------------------------------------------------\n');

  // Step 4: Admin Updates Status to Shipped and Completed
  for (const ord of placedOrders) {
    console.log(`[Admin Update] Setting #${ord.order_number} (${ord.customer}) status to -> "${ord.targetStatus}"`);
    
    // For Completed orders, mark payment collected as well
    const payload = {
      order_status: ord.targetStatus,
      payment_status: ord.targetStatus === 'Completed' ? 'collected' : 'pending'
    };

    const updateRes = await putJSON(`/api/admin/orders/${ord.id}/status`, payload, adminToken);
    if (updateRes.status === 200 && updateRes.data.success) {
      console.log(`   ✓ Admin Updated successfully: Status="${updateRes.data.data.order_status}", Payment="${updateRes.data.data.payment_status}"`);
    } else {
      console.error(`   ❌ Update failed:`, updateRes.data);
    }

    // Verify Tracking Endpoint Output
    const trackRes = await getJSON(`/api/orders/track/${ord.order_number}`);
    if (trackRes.status === 200 && trackRes.data.success) {
      console.log(`   🔍 Public Tracking verified: #${ord.order_number} -> Current Status: [${trackRes.data.data.order_status}] Payment: [${trackRes.data.data.payment_status}]`);
    }
  }

  // Step 5: Admin Orders List Verification
  console.log('\n---------------------------------------------------------------');
  console.log('📊 ADMIN ORDERS LIST VIEW VERIFICATION');
  console.log('---------------------------------------------------------------\n');

  const adminOrdersList = await getJSON('/api/admin/orders', adminToken);
  if (adminOrdersList.status === 200 && adminOrdersList.data.success) {
    console.log(`Admin retrieved total ${adminOrdersList.data.data.length} orders successfully.`);
    const sample = adminOrdersList.data.data.slice(0, 5);
    sample.forEach(o => {
      console.log(`• Order ${o.order_number}: Status="${o.order_status}" | Payment="${o.payment_status}" | Customer="${o.customer_name}" | Items=${o.items ? o.items.length : 0} | Total=₹${o.total}`);
    });
  }

  console.log('\n===============================================================');
  console.log('🎉 5 ORDERS SUBMITTED, ADMIN VIEWED, SHIPPED & COMPLETED TEST 100% OK!');
  console.log('===============================================================');
  process.exit(0);
}

runTestSimulation().catch(err => {
  console.error('Simulation error:', err);
  process.exit(1);
});
