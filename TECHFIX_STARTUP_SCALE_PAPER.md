# TechFix — Intelligent Computer Hardware Marketplace and Repair Platform
**A Full-Stack Architectural & Product Analysis for Scalable Local Hardware Retail & Service Workflows**

**Author:** Aryan Marghade  
**Date:** October 2026  
**Target Domain:** Computer Hardware Ecommerce, Custom PC Assembly, Hardware Diagnostics & Local Service Delivery  
**Document Classification:** Startup Technical & Product Architecture Blueprint

---

## 1. Abstract

Computer hardware commerce in emerging metropolitan regions is characterized by a high degree of fragmentation, information asymmetry regarding component compatibility, and friction in post-purchase repair diagnostics. **TechFix** is engineered as an integrated, commercial-grade technology platform addressing this market opportunity. The platform unifies an e-commerce hardware catalog, a rule-based custom PC configuration engine, a transparent doorstep repair booking and estimation workflow, and a localized artificial intelligence advisory layer. Backed by a transactional PostgreSQL relational database, strict server-side authorization gates, and automated Playwright browser end-to-end verification, TechFix establishes a robust, auditable baseline for high-reliability consumer hardware retail.

---

## 2. Problem Statement

Retail hardware consumers face several distinct challenges:
1. **Catalog Fragmentation & Inauthentic Inventory:** Difficulty distinguishing between verified official warranty distribution and grey-market hardware.
2. **PC Component Incompatibility:** Modern PC configuration requires tracking socket standards (e.g., LGA1700 vs. AM5), memory generations (DDR4 vs. DDR5), form factors (ATX, Micro-ATX, Mini-ITX), physical GPU length clearances, and power supply (PSU) transient headroom. Incompatible purchases lead to high return rates and customer frustration.
3. **Opaque Repair Diagnostics:** Traditional repair centers operate without audit trails, leading to unpredictable quotes, lack of formal customer approval gates, and zero live tracking.
4. **Checkout & Order Abandonment Risks:** Overly aggressive forced sign-up gates lead to high bounce rates during initial browsing, while unverified guest checkouts introduce fraudulent orders.

---

## 3. Proposed Solution & Objectives

TechFix resolves these structural friction points by delivering:
* **Frictionless Top-of-Funnel Browsing:** Guests can search, filter, assemble carts, and configure custom PCs freely without premature sign-in friction.
* **Guarded Transactional Checkout:** Orders are protected by mandatory authentication at the final order submission step, preserving full cart and address context across login/registration.
* **Component-Level Compatibility Validation:** Deterministic server-side evaluation of hardware constraints before checkout.
* **Service Lifecycle Tracking:** Transparent doorstep repair ticket tracking with formal estimate approval dialogs.
* **Grounded AI Assistance:** Local LLM query engine retrieving active PostgreSQL catalog context rather than generating hallucinated recommendations.

---

## 4. Target User Personas

| Persona | Primary Needs & Use Cases | Platform Value Proposition |
| :--- | :--- | :--- |
| **Students & Developers** | Budget laptops, Linux-ready machines, clean OS installation media. | Pre-configured Linux laptops, bootable flash drives, competitive COD pricing. |
| **Gamers & Creators** | High-performance GPUs, low-latency RAM, high-refresh monitors. | Custom PC Builder with automatic wattage calculation and verified presets. |
| **Office & Enterprise** | Bulk workstations, reliable peripherals, tax-compliant invoicing. | Automated GST-compliant Tax Invoice generation and admin bulk export. |
| **Repair Customers** | Doorstep laptop screen replacements, fan cleaning, thermal repasting. | Live status timeline (`TF-REP-YYYY-XXXX`) and diagnostic estimate approval. |

---

## 5. System Architecture

TechFix adheres to a layered, stateless client-server architecture backed by a transactional relational persistence layer:

```text
                     ┌───────────────────────────────┐
                     │   Modern Web Browser Client   │
                     │  (HTML5 / CSS3 / Vanilla JS)  │
                     └───────────────┬───────────────┘
                                     │ HTTPS / REST
                                     ▼
                     ┌───────────────────────────────┐
                     │   Node.js / Express.js Core   │
                     ├───────────────────────────────┤
                     │ • Auth & Role Middleware      │
                     │ • Compatibility Engine        │
                     │ • Order Transaction Manager   │
                     │ • AI Prompt Builder & Guard   │
                     └───────┬───────────────┬───────┘
                             │               │
            Parameterized SQL│               │HTTP Local Socket
                             ▼               ▼
                 ┌──────────────────┐  ┌──────────────────┐
                 │ PostgreSQL 14+   │  │  Ollama Daemon   │
                 │ (techfix_db)     │  │  (qwen2.5:3b)    │
                 │ Source of Truth  │  │  AI Advisory     │
                 └──────────────────┘  └──────────────────┘
```

---

## 6. PC Builder Engine Architecture

The PC Builder module models real-world hardware compatibility using deterministic relational constraints:

```text
[ User Selects Components ]
         │
         ├── CPU (Socket, Wattage)
         ├── Motherboard (Socket, RAM Generation, Form Factor)
         ├── RAM (Generation, Capacity)
         ├── GPU (Length, Wattage)
         ├── PSU (Rated Wattage)
         └── Cabinet (Max GPU Length, Form Factor Support)
         │
         ▼
[ Rule Validation Engine ]
 ├── CPU.Socket === Motherboard.Socket (e.g., AM5 vs LGA1700)
 ├── RAM.Generation === Motherboard.RAM_Type (e.g., DDR5 vs DDR4)
 ├── Motherboard.Form_Factor ∈ Cabinet.Supported_Factors
 ├── GPU.Length <= Cabinet.Max_GPU_Clearance
 └── PSU.Wattage >= (System_Wattage * 1.25)
         │
         ▼
[ Compatibility State Output ]
 ✓ Compatible (100% Validated) | ⚠ Warning (Headroom) | ✕ Incompatible (Conflict)
```

---

## 7. Security Architecture & Threat Mitigation

TechFix enforces defense-in-depth principles across all endpoints:

1. **Authentication & Token Storage:** Passwords hashed with bcrypt (10 rounds). JWT tokens signed with secure server secrets and verified on state-changing routes.
2. **Authorization Boundary:** Admin operations require `requireAdmin` middleware. Customer endpoints (`/api/orders/my-orders`, `/api/orders/:id/invoice`) ensure users can only access their own records.
3. **Transactional Concurrency:** Orders are wrapped in PostgreSQL `BEGIN ... COMMIT` blocks with `SELECT ... FOR UPDATE` row locks to prevent overselling inventory during concurrent checkouts.
4. **SQL Injection & XSS Defense:** Strict parameterized query bindings throughout `server/db/index.js` and input sanitization on review submissions.
5. **AI Prompt Injection Guardrails:** Chat queries undergo pattern matching against system-level intrusion keywords (`drop table`, `password_hash`, `show database`), preventing credential exposure.

---

## 8. Scalability & Growth Strategy

To evolve TechFix from a single-instance MVP to a high-concurrency commercial platform:

* **Caching Layer:** Introduce Redis for product catalog read-heavy queries and session caching.
* **Database Scaling:** Implement read replicas for catalog browsing while reserving primary PostgreSQL instances for transactional checkouts.
* **Storage & Static Assets:** Offload product images and invoices to AWS S3 / Cloudflare R2 with global CDN edge caching.
* **Asynchronous Processing:** Move PDF invoice generation, email notifications, and repair dispatch to background message queues (e.g., BullMQ with Redis).

---

## 9. Conclusion

TechFix demonstrates that a localized computer hardware e-commerce and repair platform can combine rich consumer UX, component-level engineering validation, and robust transactional security without excessive architectural complexity. By leveraging PostgreSQL as an uncompromised source of truth and validating end-to-end user journeys with Playwright automation, TechFix establishes a viable, scalable foundation for modern hardware retail.
