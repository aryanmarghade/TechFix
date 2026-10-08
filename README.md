# TechFix — Intelligent Computer Hardware Marketplace & Repair Platform

> **"Buy. Build. Repair. Delivered."**  
> A full-stack commercial e-commerce, custom PC configuration engine, doorstep repair management, and AI-assisted hardware recommendation system backed by PostgreSQL.

---

## 📌 Problem

Computer hardware procurement and maintenance in local markets face severe structural friction:
1. **Fragmented Hardware Sourcing:** Customers juggle multiple vendors to find authentic components, genuine storage media, and pre-built rigs with verifiable warranties.
2. **PC Builder Compatibility Confusion:** Assembling custom PCs requires matching complex hardware standards (CPU sockets, RAM generations, chassis clearance, PSU headroom, and thermal limits), resulting in costly ordering mistakes.
3. **Opaque Repair Workflows:** Traditional repair shops provide zero real-time visibility into diagnostics, technician notes, or formal customer cost approvals.
4. **Poor Local Fulfillment:** Customers frequently lack reliable doorstep Cash on Delivery (COD) services backed by local technician support.

---

## 💡 Solution

**TechFix** provides a unified, production-grade e-commerce marketplace and repair ecosystem:
* **Curated Hardware Catalog:** Real-time PostgreSQL inventory for Laptops, Linux Laptops, Pre-Built PCs, Internal/External SSDs, OS & Linux Pen Drives, Mice, Keyboards, Monitors, and Accessories.
* **Component-Level Compatibility Engine:** Multi-point rule verification (Socket, RAM type, PSU wattage headroom, form factors, and chassis clearance).
* **Doorstep Repair Portal:** Full service ticket lifecycle (Requested → Diagnosing → Estimate Approval → Repairing → Completed) with customer cost approvals.
* **Secured Checkout:** Mandatory guest authentication gate, transactional order creation with atomic stock decrements, and downloadable GST-compliant Tax Invoices.
* **Local AI Assistant:** Ollama-powered hardware advisor grounded in real PostgreSQL inventory data with offline fallback and prompt-injection guardrails.
* **Unified Admin Panel:** Real-time analytics, inline stock management, order/status dispatch, review moderation, and CSV bulk import/export.

---

## 🚀 Core Features

* **Hardware Catalog & Filtering:** Real-time search across names, brands, SKUs, and specifications with instant category switching.
* **Custom PC Builder:** Interactive part selector with 1-click curated templates (Office, Workstation, 1080p Esports, and 4K Ultra) and build-to-cart bundling.
* **Repair Management:** Unique ticket generator (`TF-REP-YYYY-XXXX`) and diagnostic workflow with customer estimate approval.
* **Customer Dashboard:** Order tracking, invoice downloads, saved PC configurations, wishlist management, and address book.
* **Admin Operations:** Sales-by-day charts, order status updates, CSV catalog import/export, and customer management.
* **Ollama AI Integration:** Optional local LLM (`qwen2.5:3b`) query engine reading real inventory with prompt injection protection.

---

## 🛠️ Technology Stack

* **Frontend:** Vanilla HTML5, CSS3 (Modern Glassmorphism & Custom Properties), Vanilla JavaScript (ES6+ async/await).
* **Backend:** Node.js, Express.js REST API.
* **Database:** PostgreSQL (`techfix_db`) with transactional connection pooling via `pg`.
* **AI Engine:** Ollama local daemon (`127.0.0.1:11434`, model: `qwen2.5:3b`).
* **Testing & QA:** Playwright (Chromium E2E browser automation) & Node.js assert test suites.

---

## 🏗️ System Architecture

```text
  [ User / Client Browser ]
             │
             ▼
  [ Express.js REST API (Port 5000) ]
   ├── Authentication & Security (JWT, bcrypt, Rate Limiting)
   ├── Orders & Transactions (Atomic Stock Reduction)
   ├── PC Compatibility Engine (Sockets, RAM, PSU)
   └── Ollama Retrieval Augmentation (Catalog Context Injection)
             │                          │
             ▼                          ▼
  [ PostgreSQL Database ]     [ Ollama AI Daemon (11434) ]
   (Source of Truth)           (qwen2.5:3b Local Model)
```

---

## 🔒 Security & Data Protection

* **Authentication:** Bcrypt password hashing (10 salt rounds) and JWT verification.
* **Authorization Gates:** Strict server-side middleware (`authenticateToken`, `requireAdmin`) protecting all admin endpoints and customer-specific orders/invoices.
* **Input Sanitization:** Parameterized SQL queries preventing SQL injection across all endpoints.
* **Checkout Integrity:** Backend validates inventory, subtotal, and coupons independently of browser payloads. Duplicate submission prevention on rapid clicks.
* **Safe Deletions:** Products referenced in historical orders are soft-deactivated (`active = false`) to preserve foreign key constraints.

---

## 📦 Local Installation & Setup

### Prerequisites
* Node.js v18+
* PostgreSQL v14+
* (Optional) Ollama with `qwen2.5:3b` model

### Steps

1. **Clone Repository & Install Dependencies:**
   ```bash
   git clone https://github.com/aryanmarghade/TechFix.git
   cd TechFix
   npm install
   ```

2. **Configure Environment Variables:**
   Create `.env` based on `.env.example`:
   ```env
   PORT=5000
   NODE_ENV=development
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=techfix_db
   JWT_SECRET=your_jwt_secret_key
   OLLAMA_HOST=127.0.0.1
   OLLAMA_PORT=11434
   OLLAMA_MODEL=qwen2.5:3b
   ```

3. **Initialize Database:**
   ```bash
   # Create database in PostgreSQL
   psql -U postgres -c "CREATE DATABASE techfix_db;"
   # Run schema and seed scripts
   psql -U postgres -d techfix_db -f sql/schema-postgresql.sql
   psql -U postgres -d techfix_db -f sql/seed-postgresql.sql
   node server/db/migrate-features.js
   ```

4. **Start Application Server:**
   ```bash
   node server/app.js
   ```
   Server will be available at `http://localhost:5000`.

5. **Run Test Suites:**
   ```bash
   node validate-qa.js
   node test-e2e.js
   node test-real-browser-ui.js
   ```

---

## 📊 Test Verification Baseline

```text
Automated API / Integration Tests: 36/36 PASS
Playwright Real Browser UI Tests:  14/14 PASS
Security Enforcement Tests:        5/5 PASS
Mobile Viewport Responsiveness:    3/3 PASS
Ollama AI & Offline Fallback:      3/3 PASS
Remaining Issues:                  None
```

---

## 🗺️ Future Roadmap

* Payment Gateway Integration (Razorpay / UPI / Cards).
* Real-time Delivery Tracking via Logistics Webhooks.
* Automated Reordering & Inventory Forecasting for Admin.
* Multi-technician dispatch scheduling mobile app.

---

## 📄 License & Status
**Status:** MVP / Demo-Ready Platform  
**License:** ISC License © 2026 TechFix Store.
