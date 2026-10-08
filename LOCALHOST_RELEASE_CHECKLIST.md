# TechFix Localhost Release Checklist & Acceptance

## 1. Acceptance Checklist

- [x] **PostgreSQL Single Source of Truth**: All products, orders, users, repairs, reviews, and coupons query PostgreSQL.
- [x] **Customer Authentication**: Registration, bcrypt password hashing, login, profile updates, and JWT sessions verified.
- [x] **Admin Authorization**: Strict server-side `requireAdmin` barrier on `/admin.html` and `/api/admin/*`.
- [x] **Product Catalog & Search**: 208 products, category filters, sorting, and parameterized search across names, brands, and SKUs.
- [x] **Cart & Pricing Security**: Client-supplied prices ignored; server recalculates subtotal, discounts, and delivery fees.
- [x] **Cash on Delivery (COD) Checkout**: Atomic stock deduction, pincode routing, guest redirect with cart preservation.
- [x] **Duplicate Order Protection**: Row-level locking (`SELECT ... FOR UPDATE`) prevents race conditions and duplicate orders.
- [x] **Inventory Integrity**: Stock never becomes negative; low-stock alerts trigger automatically at `<= 5` units.
- [x] **Local Delivery Workflow**: Practical local delivery lifecycle (`Order Placed` → `Confirmed` → `Packed` → `Out for Delivery` → `Delivered`).
- [x] **Repair Workbench**: 6-stage diagnostic lifecycle with written customer estimate approval.
- [x] **Support Ticketing**: Multi-message inquiry system for logged-in customers with admin replies.
- [x] **Custom PC Builder**: Real-time compatibility engine verifying CPU sockets, RAM generations, and wattage headroom.
- [x] **Customer Dashboard**: Complete self-service portal for orders, saved builds, repairs, wishlist, and profile.
- [x] **Admin Operations Center**: Executive KPIs, dynamic revenue charts, stock alerts, review moderation, and settlement.
- [x] **AI / Ollama Guardrails**: Prompt injection defense, inventory grounding, and automated offline fallback.
- [x] **File Upload Security**: Extension/MIME validation, isolated directory, path traversal defenses.
- [x] **HTTP Security Headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`.
- [x] **Clean Localhost Startup**: Documented via `LOCALHOST_SETUP.md` and runnable via `npm start`.
- [x] **No Fake Gateways / Couriers**: Explicitly structured around COD and local fulfillment without mock token services.
