# TechFix Business Operations Manual & Standard Operating Procedures

## 1. Customer Order Fulfillment Workflow
1. **Order Receipt**: Customer places COD order. Order state initializes to `Order Placed`.
2. **Order Confirmation & Packing**:
   - Staff verifies items in warehouse inventory.
   - Staff updates order status in Admin to `Packed`.
   - ESD packaging and bubble wrap applied.
3. **Dispatch & Out for Delivery**:
   - Delivery personnel assigned for Mumbai/Thane zone.
   - Status updated to `Out for Delivery`.
4. **Cash Settlement & Completion**:
   - Delivery executive verifies tamper seal, collects cash, and delivers package.
   - Admin marks order as `Completed` (or `Delivered`).

---

## 2. Repair Diagnostic & Approval Lifecycle
1. **Request Intake**: Customer books diagnostic with device type, model, and symptoms.
2. **Physical Inspection**: Technician inspects motherboard, displays, or storage in workbench.
3. **Estimate Preparation**: Admin adds diagnostic findings and itemized estimate (`/api/admin/repairs/:id/estimate`).
4. **Customer Approval**: Customer reviews estimate in account dashboard and clicks `Approve Estimate`.
5. **Execution & Return**: Technician completes repair and marks status `Ready for Delivery`.

---

## 3. Inventory Stock Control & Threshold Rules
- Products with stock `<= 5` trigger real-time alerts on the Admin Executive Dashboard.
- Stock adjustments require authorized admin session tokens and are logged with previous and updated quantities.
