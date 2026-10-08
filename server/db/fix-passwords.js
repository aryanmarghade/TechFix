const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixSeedPasswords() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: 5432,
    user: 'postgres',
    password: process.env.DB_PASSWORD || 'aryan',
    database: 'techfix_db'
  });
  await client.connect();

  const adminHash = await bcrypt.hash('admin123', 10);
  const customerHash = await bcrypt.hash('customer123', 10);

  await client.query('UPDATE users SET password_hash = $1 WHERE email = $2', [adminHash, 'admin@techfix.com']);
  await client.query('UPDATE users SET password_hash = $1 WHERE email = $2', [customerHash, 'aryan@example.com']);

  console.log('Fixed passwords for admin@techfix.com and aryan@example.com');
  await client.end();
}

fixSeedPasswords().catch(console.error);
