# Oven Xpress — Customer Application Architecture

## 1. Executive Summary

The Oven Xpress platform is architecturally partitioned into two dedicated applications operating against a shared restaurant data foundation:

1. **`OvenXpress` (This Repository)**: Customer-facing Web Application.
   - Purpose: End-to-end customer ordering lifecycle (discovery, menu browsing, cart management, checkout, live tracking, order history, and customer profile).
   - Strict Boundary: Exposes **only** customer roles (`CUSTOMER`). Contains zero staff, inventory, expense, or operational management capabilities.

2. **`Oven_Xpress` (Separate Repository)**: Operational Platform.
   - Purpose: Owner, Branch Manager, Kitchen Display System (KDS), Staff POS, and Inventory/Purchasing management.
   - Strict Boundary: Protected by internal operational sessions (`ox_session`). Never exposed directly to public customers.

---

## 2. Core Architectural Flow

```
┌────────────────────────────────────────────────────────┐
│             Customer UI (React 18 + Vite)              │
│       Tailwind CSS + Shadcn UI + Radix Primitives      │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP (Axios) / WSS (Socket.io)
                            ▼
┌────────────────────────────────────────────────────────┐
│             Customer REST & Realtime Gateway           │
│             Express 4.19 + Socket.io Server            │
│       - Security Headers (Helmet, Rate Limiter)        │
│       - Auth Middleware (JWT Verification)             │
│       - Role Guard (Enforces 'customer')               │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             Business & Security Services               │
│  - Authoritative Server-Side Pricing (P0 Requirement)  │
│  - Coupon Validity & Discount Rules                    │
│  - IDOR Protection (Scoped to authenticated customer)  │
│  - Menu Projections (Internal costs stripped)          │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│               Shared MongoDB Database                  │
│       Collections: users, menuitems, orders, coupons   │
└────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

- **Client Runtime**: React 18.3.1, TypeScript 5.8, Vite 5.4.
- **Styling & UI**: Tailwind CSS 3.4 with custom theme tokens (`warm-orange`, `deep-red`, `rich-brown`, `soft-tan`), 49 Shadcn UI / Radix primitives, Lucide React icons.
- **Client State**:
  - `AuthContext`: Manages customer JWT tokens, profile caching in `localStorage`, login/logout/registration states.
  - `CartContext`: Client-side cart item collection, quantity manipulation, client coupon state.
  - `useSocket`: Authenticated real-time room connection (`user_${userId}`).
- **Backend Runtime**: Node.js 18+ (ESM modules), Express 4.19.2, Socket.io 4.8.
- **Database Layer**: MongoDB via Mongoose 8.7.0.

---

## 4. Route Architecture

```
/
├── /menu                        # Public customer menu catalog (categories, search)
├── /cart                        # Customer shopping cart & checkout trigger
├── /orders                      # Authenticated customer order history & reorder
├── /orders/:orderId             # Authenticated live order status tracking
├── /profile                     # Authenticated customer profile & addresses
├── /login                       # Customer sign-in
├── /signup                      # Customer account registration
├── /forgot-password             # Cryptographically secure password reset request
└── /reset-password              # Password reset confirmation with single-use token
```

All operational routes (`/staff`, `/staff/:id`, `/inventory`, `/manager/branch/:id`, `/kitchen`, `/founderr`) have been completely purged from the customer application.

---

## 5. Security & Isolation Guarantees

1. **Server-Authoritative Pricing (P0)**:
   - Prices sent by client in requests are **never trusted**.
   - Subtotal, GST (5%), delivery fees (₹40 for delivery, ₹0 for takeaway/dine-in), and discounts are calculated strictly server-side using current database records.
2. **Strict Customer Authorization**:
   - Customer authentication tokens are strictly bound to `role: 'customer'`.
   - Any attempt to access internal staff or management routes is denied.
3. **No Internal Data Exposure**:
   - Menu APIs project explicit customer-safe DTOs.
   - Internal purchase costs (`cost`), recipe BOM quantities, supplier details, and margins are stripped prior to serialization.
4. **Ownership Verification (IDOR Defense)**:
   - All order history, order tracking, address updates, and profile edits are scoped strictly to `req.user.id`.
   - A customer cannot view or mutate another customer's orders or delivery addresses.
