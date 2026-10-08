const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDB() {
  const rootClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'aryan',
    database: 'postgres'
  });

  await rootClient.connect();
  const dbName = process.env.DB_NAME || 'techfix_db';
  const res = await rootClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  if (res.rowCount === 0) {
    console.log(`Creating database ${dbName}...`);
    await rootClient.query(`CREATE DATABASE ${dbName}`);
  } else {
    console.log(`Database ${dbName} already exists.`);
  }
  await rootClient.end();

  const appClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'aryan',
    database: dbName
  });

  await appClient.connect();
  console.log('Applying schema-postgresql.sql...');
  const schemaSQL = fs.readFileSync(path.join(__dirname, '..', '..', 'sql', 'schema-postgresql.sql'), 'utf-8');
  await appClient.query(schemaSQL);
  console.log('Schema applied successfully.');

  console.log('Applying seed-postgresql.sql...');
  const seedSQL = fs.readFileSync(path.join(__dirname, '..', '..', 'sql', 'seed-postgresql.sql'), 'utf-8');
  await appClient.query(seedSQL);
  console.log('Seed data inserted successfully.');

  const productCount = await appClient.query('SELECT COUNT(*) FROM products');
  const userCount = await appClient.query('SELECT COUNT(*) FROM users');
  console.log(`Initialized successfully! Products: ${productCount.rows[0].count}, Users: ${userCount.rows[0].count}`);

  await appClient.end();
}

initDB().catch(err => {
  console.error('DB Initialization Error:', err);
  process.exit(1);
});
