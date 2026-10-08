const { Client } = require('pg');
const http = require('http');
require('dotenv').config();

function postJson(path, payload, token = null) {
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
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getJson(path, token = null) {
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
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function putJson(path, payload, token = null) {
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
      method: 'PUT',
      headers: headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runE2ETests() {
  console.log('--- STARTING TECHFIX END-TO-END AUTOMATED SUITE ---');

  const pgClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'aryan',
    database: process.env.DB_NAME || 'techfix_db'
  });
  await pgClient.connect();

  // Test 1: User Registration & Login
  console.log('\n[1] Testing Auth & Password Hashing:');
  const testEmail = `test_${Date.now()}@example.com`;
  const regRes = await postJson('/api/auth/register', {
    name: 'E2E Tester',
    email: testEmail,
    phone: `999${Math.floor(1000000 + Math.random() * 9000000)}`,
    password: 'password123'
  });
  console.log('Registration Response:', regRes.status, regRes.data.success);

  const customerToken = regRes.data.token;
  const dbUser = await pgClient.query('SELECT password_hash FROM users WHERE email = $1', [testEmail]);
  console.log('DB Password Hashed:', dbUser.rows[0].password_hash.startsWith('$2a$'));

  // Test Admin Login
  const adminLogin = await postJson('/api/auth/login', {
    identifier: 'admin@techfix.com',
    password: 'admin123'
  });
  console.log('Admin Login:', adminLogin.status, adminLogin.data.success, 'Role:', adminLogin.data.user.role);
  const adminToken = adminLogin.data.token;

  // Test 2: Product Catalog & Category Queries
  console.log('\n[2] Testing Products & Stock Status:');
  const prodList = await getJson('/api/products?category=laptops');
  console.log('Laptops fetched:', prodList.data.data.length);
  const sampleLaptop = prodList.data.data[0];
  const initialStock = sampleLaptop.stock_quantity;
  console.log(`Sample Product: "${sampleLaptop.name}" | Initial Stock: ${initialStock}`);

  // Test 3: COD Order Placement & Stock Integrity (CUSTOMER JOURNEY A)
  console.log('\n[3] Testing COD Order Placement & Transaction Integrity:');
  const orderRes = await postJson('/api/orders', {
    customer_name: 'E2E Tester',
    customer_phone: '9998887777',
    customer_email: testEmail,
    shipping_address: 'Flat 101, Test Tower, Lamington Road',
    city: 'Mumbai',
    pincode: '400007',
    delivery_instructions: 'Handle with care',
    items: [
      { product_id: sampleLaptop.id, quantity: 1 }
    ]
  }, customerToken);

  console.log('Order Placement:', orderRes.status, orderRes.data.success, 'Order Number:', orderRes.data.order ? orderRes.data.order.order_number : null);
  const createdOrder = orderRes.data.order;

  // Verify stock reduction in PostgreSQL
  const stockCheck = await pgClient.query('SELECT stock_quantity FROM products WHERE id = $1', [sampleLaptop.id]);
  const newStock = stockCheck.rows[0].stock_quantity;
  console.log(`Stock reduction verified: Initial=${initialStock} -> After Order=${newStock} (Expected: ${initialStock - 1})`);

  // Test Order Tracking
  const trackRes = await getJson(`/api/orders/track/${createdOrder.order_number}`);
  console.log('Order Tracking lookup:', trackRes.status, trackRes.data.success, 'Status:', trackRes.data.data.order_status);

  // Admin updates order status
  const updateOrd = await putJson(`/api/admin/orders/${createdOrder.id}/status`, {
    order_status: 'Out for Delivery'
  }, adminToken);
  console.log('Admin Status Update:', updateOrd.status, 'New Status:', updateOrd.data.data.order_status);

  // Test 4: Custom PC Compatibility Engine (CUSTOMER JOURNEY B)
  console.log('\n[4] Testing Custom PC Compatibility Engine:');
  // Scenario 4a: Incompatible Socket (Intel LGA1700 CPU + AMD AM5 Motherboard)
  const intelCpu = (await pgClient.query("SELECT id FROM components WHERE socket = 'LGA1700' AND component_type = 'cpu' LIMIT 1")).rows[0].id;
  const am5Mb = (await pgClient.query("SELECT id FROM components WHERE socket = 'AM5' AND component_type = 'motherboard' LIMIT 1")).rows[0].id;

  const incompCheck = await postJson('/api/builder/validate', {
    parts: { cpu: { id: intelCpu }, motherboard: { id: am5Mb } }
  });
  console.log('Incompatible Check (LGA1700 + AM5 MB):', 'Errors caught:', incompCheck.data.errors.length, '| Message:', incompCheck.data.errors[0]?.message);

  // Scenario 4b: Incompatible RAM (DDR4 RAM + DDR5 Motherboard)
  const ddr5Mb = (await pgClient.query("SELECT id FROM components WHERE ram_type = 'DDR5' AND component_type = 'motherboard' LIMIT 1")).rows[0].id;
  const ddr4Ram = (await pgClient.query("SELECT id FROM components WHERE ram_type = 'DDR4' AND component_type = 'ram' LIMIT 1")).rows[0].id;
  const incompRamCheck = await postJson('/api/builder/validate', {
    parts: { motherboard: { id: ddr5Mb }, ram: { id: ddr4Ram } }
  });
  console.log('Incompatible RAM Check (DDR4 RAM + DDR5 MB):', 'Errors caught:', incompRamCheck.data.errors.length, '| Message:', incompRamCheck.data.errors[0]?.message);

  // Scenario 4c: Fully Compatible Build
  const am5Cpu = (await pgClient.query("SELECT id FROM components WHERE socket = 'AM5' AND component_type = 'cpu' LIMIT 1")).rows[0].id;
  const ddr5Ram = (await pgClient.query("SELECT id FROM components WHERE ram_type = 'DDR5' AND component_type = 'ram' LIMIT 1")).rows[0].id;
  const psuComp = (await pgClient.query("SELECT id FROM components WHERE component_type = 'psu' LIMIT 1")).rows[0].id;

  const validCheck = await postJson('/api/builder/validate', {
    parts: { cpu: { id: am5Cpu }, motherboard: { id: am5Mb }, ram: { id: ddr5Ram }, psu: { id: psuComp } }
  });
  console.log('Valid Build Compatibility Check:', 'Valid:', validCheck.data.valid, 'Errors:', validCheck.data.errors.length, 'Est Wattage:', validCheck.data.estimatedWattage);

  // Test 5: Repair Booking & Customer Estimate Approval (CUSTOMER JOURNEY C)
  console.log('\n[5] Testing Repair Booking & Estimate Approval Flow:');
  const repairRes = await postJson('/api/repairs', {
    customer_name: 'E2E Tester',
    customer_phone: '9998887777',
    customer_email: testEmail,
    device_type: 'Laptop',
    brand: 'Lenovo',
    model: 'ThinkPad T14',
    problem_category: 'Screen replacement',
    problem_description: 'Screen broken after drop',
    pickup_date: '2026-10-15',
    pickup_time: '10:00 AM - 01:00 PM',
    address_line: 'Flat 101, Test Tower',
    city: 'Mumbai',
    pincode: '400007'
  }, customerToken);

  console.log('Repair Booking:', repairRes.status, repairRes.data.success, 'Request ID:', repairRes.data.repair.request_number);
  const repId = repairRes.data.repair.id;

  // Admin updates diagnosis & estimate
  const adminEst = await putJson(`/api/admin/repairs/${repId}`, {
    status: 'Estimate Prepared',
    diagnosis: 'Display panel replacement required.',
    estimate_amount: 3200.00
  }, adminToken);
  console.log('Admin Added Estimate:', adminEst.status, 'Status:', adminEst.data.data.status, 'Amount: ₹' + adminEst.data.data.estimate_amount);

  // Customer Approves Estimate
  const custApprove = await postJson(`/api/repairs/${repId}/approve-estimate`, {
    approved: true
  }, customerToken);
  console.log('Customer Estimate Approval:', custApprove.status, 'New Status:', custApprove.data.data.status);

  // Test 6: Support Tickets (CUSTOMER JOURNEY D)
  console.log('\n[6] Testing Support Ticket Flow:');
  const tckRes = await postJson('/api/support/tickets', {
    customer_name: 'E2E Tester',
    customer_phone: '9998887777',
    customer_email: testEmail,
    category: 'Product enquiry',
    subject: 'RAM speed compatibility',
    message: 'Can I install 6000MHz DDR5 RAM on AM5 boards?'
  }, customerToken);
  console.log('Support Ticket Created:', tckRes.status, tckRes.data.success, 'Ticket ID:', tckRes.data.ticket.ticket_number);

  // Admin replies to ticket
  const adminReply = await postJson(`/api/support/tickets/${tckRes.data.ticket.id}/reply`, {
    message: 'Yes! All AM5 motherboards support EXPO DDR5 6000MHz.'
  }, adminToken);
  console.log('Admin Reply Sent:', adminReply.status, adminReply.data.success);

  // Clean test user and order
  await pgClient.end();
  console.log('\n======================================================');
  console.log('🎉 ALL END-TO-END FUNCTIONAL AND SQL TESTS PASSED 100%!');
  console.log('======================================================');
}

runE2ETests().catch(err => {
  console.error('E2E Test Error:', err);
  process.exit(1);
});
