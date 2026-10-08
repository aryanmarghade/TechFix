# TechFix Startup Architecture & System Design

## 1. System Overview
TechFix is an ecommerce and engineering platform designed for hardware sales, custom PC assembly, and transparent computer diagnostic repairs.

---

## 2. Technical Stack & Infrastructure
- **Web & API Layer**: Node.js & Express 5.x.
- **Database**: PostgreSQL with connection pooling (`pg`), row-level locks for stock concurrency, and strict relational integrity.
- **Client Tier**: Modern vanilla HTML/CSS/JS adopting the 60–30–10 visual hierarchy.
- **AI Diagnostics**: Local Ollama LLM integration (`qwen2.5:3b`) with deterministic rule-based catalog fallback.

---

## 3. Core Business Subsystems
1. **Catalog & Inventory Engine**: Category hierarchies, stock threshold tracking, real-time search with SKU/brand indexing.
2. **Deterministic PC Compatibility Engine**: Socket verification, DDR4/DDR5 memory check, power supply wattage calculation.
3. **Transactional COD Checkout**: Server-calculated pricing, atomic stock deduction, and pincode-based delivery routing.
4. **Repair Diagnostic Workbench**: 6-stage lifecycle tracking (Request → Diagnostic → Written Estimate → Approval → Repair → Delivery).
5. **Admin Operations Control Center**: Real PostgreSQL analytics, live order pipelines, inventory health alerts, and moderation.

---

## 4. Security & Compliance
- Passwords hashed with `bcryptjs`.
- JWT session management with HTTP cookies and Authorization headers.
- Parameterized SQL queries preventing injection attacks.
- 0 npm vulnerabilities.
