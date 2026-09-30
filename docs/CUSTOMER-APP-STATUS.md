# Oven Xpress — Customer Application Status

**Phase**: Phase 2 — Database Unification (Neon PostgreSQL) + Branch Discovery & Architecture  
**Status**: Completed  
**Last Updated**: September 2026

---

## 1. Accomplishments Overview

### Phase 1: Security & Cleanup
- Purged all internal restaurant-operations code (`BranchManager.tsx`, `Kitchen.tsx`, `Founderr.tsx`, `Inventory.tsx`, `Staff.tsx`, `StaffProfile.tsx`, internal APIs).
- Implemented P0 server-authoritative pricing (ignoring client prices, 5% GST, ₹40 delivery fee).
- IDOR protection across orders and addresses.
- Cryptographically secure password recovery (`/forgot-password`, `/reset-password`).
- Order history (`/orders`) and live tracking stepper (`/orders/:id`).

### Phase 2: PostgreSQL Unification & Branch Discovery
- **Single Source of Truth Database**: Connected `OvenXpress` backend directly to the shared Neon PostgreSQL database (`DATABASE_URL`). Purged dependency on an isolated database.
- **Shared Schema Compatibility**: Directly operates on `Branch`, `MenuCategory`, `MenuItem`, `BranchMenuItem`, `Customer`, `Order`, `OrderItem`, `OrderAuditLog`, `Payment`, `PasswordResetToken`, and `User`.
- **Real-Time Cross-App Visibility**: Orders placed in `OvenXpress` are inserted into PostgreSQL and emitted via Socket.IO directly to `Oven_Xpress` (Kitchen Display and Manager POS) instantaneously.
- **Branch Discovery Page (`/branches`)**: Search by name or area, city filter pills (Mumbai, Bengaluru, New Delhi), opening/closing hours, address, phone, and 1-click "Order from here".
- **Global Branch Context (`BranchContext.tsx`)**: Persists customer's active branch in `localStorage`.
- **Navbar Branch Selector**: Displays current active kitchen location with quick-switch modal (`BranchSelectorModal.tsx`).
- **Branch-Scoped Menu Browsing**: Queries menu items tailored to selected branch, respecting `BranchMenuItem.isAvailable` and branch pricing overrides.
- **Multi-Branch Cart Conflict Protection**: Prevents mixing items across different kitchens with a user confirmation modal.

---

## 2. Customer Routes & Pages

| Route | Page | Description |
| :--- | :--- | :--- |
| `/` | `Index.tsx` | Customer landing page & featured items |
| `/branches` | `Branches.tsx` | Branch discovery, city filtering & selection |
| `/menu` | `Menu.tsx` | Branch-scoped menu browsing, category tabs & search |
| `/cart` | `Cart.tsx` | Cart review, coupon application, order type & checkout |
| `/login` | `Login.tsx` | Customer sign-in |
| `/signup` | `Signup.tsx` | Customer registration |
| `/forgot-password` | `ForgotPassword.tsx` | Anti-enumeration password recovery request |
| `/reset-password` | `ResetPassword.tsx` | Tokenized password reset |
| `/profile` | `Profile.tsx` | Customer address book & profile settings |
| `/orders` | `Orders.tsx` | Customer order history with 1-click reorder |
| `/orders/:orderId` | `OrderDetails.tsx` | Live order status tracker & digital receipt |

---

## 3. Authoritative PostgreSQL Tables Used

- `"Branch"`: Authoritative restaurant branches, operating hours, cities, and statuses.
- `"MenuItem"` & `"MenuCategory"`: Clean customer menu catalog (no internal recipes/costs).
- `"BranchMenuItem"`: Branch-specific availability and price overrides.
- `"Customer"`: Customer CRM records synced with customer accounts.
- `"User"` & `"Role"`: Customer authentication with `'CUSTOMER'` role.
- `"Order"` & `"OrderItem"`: Customer food orders visible to both apps.
- `"OrderAuditLog"`: Immutable timeline of order state transitions.
- `"Payment"`: Payment records for cash and digital transactions.
- `"Coupon"`: Promo discount rules and validations.
- `"PasswordResetToken"`: Expiring SHA-256 password reset tokens.

---

## 4. Next Phase (Phase 3)
- Item customizations / add-ons modal (`/menu/:id`).
- Dedicated multi-step checkout workflow with saved card/UPI simulations.
