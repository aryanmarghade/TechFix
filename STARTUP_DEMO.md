# TechFix — 5-to-10 Minute Investor & Academic Startup Demo Script

> **Target Audience:** Hackathon Judges, University Evaluators, Startup Incubators, Technical Recruiters  
> **Estimated Duration:** 7–9 Minutes  
> **Demo Host URL:** `http://localhost:5000`

---

## 🎯 Demo Overview & Objectives
Demonstrate a complete, production-grade computer hardware marketplace and doorstep repair service featuring:
1. Catalog exploration with instant filter switching and multi-criteria search.
2. Custom PC Builder with real-time rule-based compatibility engine.
3. Guest-protected Cash On Delivery checkout preserving full state across authentication.
4. Customer account portal with order tracking, invoice downloads, and repair tickets.
5. Unified Admin command center with PostgreSQL analytics and inventory management.
6. Local Ollama AI recommendation assistant grounded in active database stock.

---

## ⏱️ Step-by-Step Demo Walkthrough

### 1. Introduction & Homepage (0:00 – 1:00)
* **Action:** Open `http://localhost:5000/index.html`.
* **Talking Points:**
  * *"Welcome to TechFix — Buy. Build. Repair. Delivered."*
  * *"We solve two major problems in consumer hardware: buying authentic parts with guaranteed compatibility, and getting reliable doorstep computer servicing."*
  * *"Everything you see is powered live by PostgreSQL and Node.js."*

### 2. Catalog Search & Filter Switching (1:00 – 2:15)
* **Action:** Navigate to `http://localhost:5000/shop.html`.
* **Action:** Click through `Laptops` (15 items) → `Linux Laptops` (5 items) → `Internal SSDs` (15 items) → `Reset`.
* **Action:** Type `"RTX 3050"` in the search bar and press Enter (shows 2 cards).
* **Talking Points:**
  * *"Our catalog supports instant category switching without stale query collisions."*
  * *"Every card reflects actual stock counts directly from PostgreSQL."*

### 3. Product Details, Gallery & Reviews (2:15 – 3:30)
* **Action:** Click into `"TechFix ProBook 15 Student Edition"`.
* **Action:** Click on the image thumbnails to demonstrate dynamic image previewing.
* **Action:** Scroll down to the Technical Specifications table and Customer Reviews.
* **Talking Points:**
  * *"Notice our transparent review badge system: only purchases linked to actual completed orders receive the '✓ Verified Customer' badge, while demo entries are honestly labeled."*
  * *"Related recommendations at the bottom are fetched dynamically based on category taxonomy."*

### 4. Custom PC Builder & Compatibility Engine (3:30 – 5:00)
* **Action:** Navigate to `http://localhost:5000/build-pc.html`.
* **Action:** Select the 1-click **"1080p Esports Gaming"** preset.
* **Action:** Point to the **"✓ 100% Compatible"** status box, wattage estimation (~165W), and PSU headroom recommendation.
* **Action:** Click **"Add Custom PC to Cart (COD)"**.
* **Talking Points:**
  * *"The PC Builder runs a multi-point server-side compatibility matrix checking CPU socket standards, RAM generation (DDR4 vs DDR5), and PSU wattage."*
  * *"The entire build is bundled into the shopping cart with transparent assembly fees."*

### 5. Guest Checkout Protection & Authentication Gate (5:00 – 6:15)
* **Action:** Go to `http://localhost:5000/checkout.html` while logged out (or clear session).
* **Action:** Fill shipping details and click **"Place COD Order Now"**.
* **Action:** Observe the modal: *"Please Sign In or Register"*.
* **Action:** Click **"Sign In"**, log in as `aryan@example.com` / `customer123`.
* **Action:** Notice the automatic return to `/checkout.html` with cart items and shipping details preserved.
* **Action:** Click **"Place COD Order Now"** → Land on `/order-confirmation.html`.
* **Talking Points:**
  * *"We enforce mandatory authentication before final order creation to prevent spam and ensure delivery traceability, while allowing friction-free browsing."*

### 6. Customer Dashboard, Tracking & Tax Invoices (6:15 – 7:15)
* **Action:** Navigate to `http://localhost:5000/account.html`.
* **Action:** Click **"🧾 Invoice"** to open the printable, GST-compliant tax invoice.
* **Action:** Switch to **"My Wishlist"**, **"Saved PC Builds"**, and **"Repair Requests"**.
* **Talking Points:**
  * *"Customers have full self-service access to historical orders, verified repair tickets, and instant invoice downloads."*

### 7. Unified Admin Dashboard & AI Assistant (7:15 – 8:30)
* **Action:** Open `http://localhost:5000/admin.html` (logged in as `admin@techfix.com`).
* **Action:** Show live sales-by-day charts, category revenue breakdown, and inline stock management.
* **Action:** Open the AI chat assistant widget and ask: *"Recommend an SSD for my gaming laptop"*.
* **Action:** Show the real catalog recommendations returned by the local Ollama LLM.
* **Talking Points:**
  * *"Admins have real-time visibility into revenue, repairs, and stock adjustments."*
  * *"Our AI assistant uses Retrieval-Augmented Generation from the PostgreSQL inventory, avoiding hallucinated prices or phantom hardware."*

---

## 🏁 Conclusion (8:30 – 9:00)
* *"TechFix demonstrates a complete, reliable, and production-tested full-stack hardware platform ready to scale."*
* *"Questions & Feedback are welcome!"*
