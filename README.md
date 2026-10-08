# TECHFIX — Full E-Commerce & Computer Repair Platform
> "Buy. Build. Repair. Delivered."

A complete, production-grade ecommerce and computer hardware repair web platform built using pure HTML5, CSS3, Vanilla JavaScript, Node.js/Express, and PostgreSQL (with full MySQL compatibility).

---

## 🌟 Key Features

1. **E-Commerce Catalog:**
   - Real-time catalog of Laptops, Pre-Built PCs, Pen Drives, Internal SSDs, External SSDs, and OS Pen Drives.
   - Dynamic price range, category, brand, and stock filters with instant sorting.
   - Snapshot preservation in order items for price/name immutability.

2. **Cash On Delivery (COD) Checkout:**
   - 100% Cash On Delivery payment flow with local service area validation (Mumbai, Navi Mumbai, Thane).
   - Real database transactions ensuring atomic inventory deductions and negative-stock prevention.

3. **Custom PC Builder with Real-Time Compatibility Engine:**
   - Dynamic component selection across 9 slots (CPU, Motherboard, RAM, GPU, SSD, PSU, Cooler, Cabinet, OS).
   - Validates socket compatibility (e.g. LGA1700 vs AM5), RAM generations (DDR4 vs DDR5), motherboard form factors vs case clearance, and PSU wattage headroom.
   - Direct add-to-cart of complete builds and save-to-account persistence.

4. **Doorstep Computer Repair & Home Pickup System:**
   - 7-step repair workflow: Booking -> Doorstep Pickup -> Certified Diagnosis -> Estimate Prepared -> Customer 1-Click Approval -> Repair & Testing -> Doorstep Delivery.
   - Real-time repair tracking with request reference number.

5. **Customer Dashboard & Support Tickets:**
   - User authentication with secure bcrypt password hashing.
   - Full history of placed COD orders, repair requests, saved PC builds, and interactive support tickets.

6. **Admin Operations Management:**
   - Live revenue metrics, pending orders, and repair workbench.
   - Order status progression (Order Placed -> Confirmed -> Packed -> Out for Delivery -> Delivered).
   - Inventory stock management, repair estimate preparation, and support replies.

---

## 🛠️ Technology Stack

- **Frontend:** Semantic HTML5, Vanilla CSS3 (Custom Responsive Design System), Vanilla JavaScript (ES6+).
- **Backend:** Node.js, Express.js (REST API).
- **Database:** PostgreSQL 18 (Primary tested) / MySQL 8.0+ compatible.
- **Authentication:** JWT with HttpOnly cookie support and bcryptjs password hashing.

---

## 🚀 Quickstart & Setup

### 1. Database Configuration
Ensure PostgreSQL is running locally on port 5432.
Configure credentials in `.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=techfix_db
DB_USER=postgres
DB_PASSWORD=aryan
JWT_SECRET=techfix_super_secure_jwt_secret_token_key_2026
```

### 2. Initialize Database & Run Seed Data
```bash
node server/db/init.js
node server/db/fix-passwords.js
```

### 3. Start TechFix Full-Stack Server
```bash
node server/app.js
```
Open your browser at `http://localhost:5000`

### 4. Run Automated End-to-End Test Suite
```bash
node test-e2e.js
```

---

## 🔑 Demo User Accounts

| Role | Email | Password | Access |
|---|---|---|---|
| **Administrator** | `admin@techfix.com` | `admin123` | Full Admin Operations (`/admin.html`) |
| **Customer** | `aryan@example.com` | `customer123` | Customer Account (`/account.html`) |

---

## 📁 Project Directory Structure

```
/Computer.com
├── /public
│   ├── /css/main.css               # Modern vanilla design system & responsive rules
│   ├── /js/app.js                  # State management, cart, auth & API client
│   ├── index.html                  # Homepage with hero, categories, featured grids
│   ├── shop.html                   # Catalog with filters, search, and sorting
│   ├── product.html                # Product detail with specs, gallery & reviews
│   ├── build-pc.html               # Custom PC builder & compatibility engine
│   ├── repair.html                 # Repair booking & estimate approval workbench
│   ├── pickup-delivery.html        # Doorstep pickup info & pincode verifier
│   ├── cart.html                   # Cart management & summary calculation
│   ├── checkout.html               # COD checkout form with address verification
│   ├── order-confirmation.html     # Post-checkout confirmation
│   ├── track-order.html            # Order stage timeline tracking
│   ├── account.html                # Customer dashboard with tabbed views
│   ├── help.html                   # Help center, FAQs & support ticket submission
│   ├── contact.html                # Store address & customer care
│   ├── login.html                  # Sign in portal
│   ├── register.html               # Sign up portal
│   └── admin.html                  # Operations dashboard
├── /server
│   ├── app.js                      # Express application entry point
│   ├── /db/index.js                # PostgreSQL pool connection
│   ├── /db/init.js                 # Schema & seed migration runner
│   ├── /middleware/auth.js         # JWT verification & admin guard
│   └── /routes/                    # Modular REST API routes (auth, products, orders, builder, repairs, support, admin)
├── /sql
│   ├── schema-postgresql.sql       # PostgreSQL DDL schema with foreign keys & indexes
│   ├── seed-postgresql.sql         # Seed dataset with 62 products & test records
│   ├── schema-mysql.sql            # MySQL compatible schema
│   └── seed-mysql.sql              # MySQL compatible seed dataset
├── test-e2e.js                     # Automated E2E verification test script
├── .env.example                    # Environment template
└── FUNCTIONAL_QA_REPORT.md         # Full QA verification report
```
