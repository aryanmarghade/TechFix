# TechFix Localhost Setup & Developer Guide

## 1. Prerequisites
- **Node.js**: v18.x or v20.x LTS
- **PostgreSQL**: v14, v15, or v16 installed locally
- **Ollama (Optional)**: If you want local AI chat features (`ollama run qwen2.5:3b`)

---

## 2. Quickstart Installation

1. **Clone & Install Dependencies**:
   ```bash
   git clone https://github.com/aryanmarghade/TechFix.git
   cd TechFix
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Ensure your local PostgreSQL credentials in `.env` match your local setup:
   ```ini
   PORT=5000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=techfix_db
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   JWT_SECRET=techfix_super_secure_jwt_secret_token_key_2026
   ```

3. **Initialize Database & Seed Catalog**:
   ```bash
   node server/db/init.js
   node server/db/sync-rich-builder.js
   ```

4. **Start the Localhost Server**:
   ```bash
   npm start
   ```
   Open your browser to: **`http://localhost:5000`**

---

## 3. Pre-Seeded Default Accounts

| Role | Email / Identifier | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **Customer** | `aryan@example.com` | `customer123` | Store, PC Builder, Orders, Account Dashboard |
| **Admin** | `admin@techfix.com` | `admin123` | Store + `/admin.html` Operations Control Center |

---

## 4. Running Verification Test Suites
- `npm test` or `node validate-qa.js`: Quick sanity & API assertion suite.
- `npm run test:e2e`: Comprehensive end-to-end SQL transaction and auth suite.
- `npm run test:browser`: Playwright headless browser test across all customer & admin workflows.
- `node test-security-production.js`: Production security hardening validation suite.
