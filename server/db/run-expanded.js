const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runExpandedSeed() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: 5432,
    user: 'postgres',
    password: process.env.DB_PASSWORD || 'aryan',
    database: 'techfix_db'
  });
  await client.connect();

  const sql = fs.readFileSync(path.join(__dirname, '..', '..', 'sql', 'seed-expanded.sql'), 'utf-8');
  await client.query(sql);
  console.log('Expanded seed applied successfully!');

  const catRes = await client.query('SELECT count(*) FROM categories');
  const prodRes = await client.query('SELECT count(*) FROM products');
  const compRes = await client.query('SELECT count(*) FROM components');
  console.log(`Counts -> Categories: ${catRes.rows[0].count}, Products: ${prodRes.rows[0].count}, Components: ${compRes.rows[0].count}`);

  await client.end();
}

runExpandedSeed().catch(console.error);
