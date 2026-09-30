# Customer Application Security & Hardening

## 1. Overview
This document specifies the security controls and hardening measures implemented in the Oven Xpress Customer Application.

---

## 2. Implemented Security Controls

### 2.1 Server-Side Authoritative Pricing (P0)
- **Vulnerability Mitigated**: Client tampering of prices, subtotals, tax rates, coupon discounts, or final payable total.
- **Implementation**: In `backend/src/controllers/orderController.js`, incoming pricing properties in request bodies are ignored. Item unit prices are retrieved from MongoDB. Taxes (5%), delivery fees (₹40 for delivery, ₹0 for others), and discounts are calculated strictly on the backend.

### 2.2 IDOR Prevention (Insecure Direct Object References)
- **Vulnerability Mitigated**: A customer guessing or substituting another customer's order ID or address ID to view private data or modify addresses.
- **Implementation**:
  - `getOrderById`: Queries `{ $or: [{ _id: id, customer: userId }, { orderNumber: id, customer: userId }] }`.
  - `getMyOrders`: Scoped to `{ customer: userId }`.
  - `updateAddress` / `deleteAddress`: Validates that the subdocument belongs to `user.addresses` for `req.user.id`.

### 2.3 Privilege Escalation & Role Boundaries
- **Vulnerability Mitigated**: Registering with `role: "admin"` or `role: "founder"` to gain management privileges.
- **Implementation**:
  - `registerController` forces `role: 'customer'`.
  - Internal operations pages and services (`BranchManager`, `Kitchen`, `Founderr`, `Inventory`, `Staff`) have been completely deleted from the customer application.
  - `ProtectedRoute` enforces customer authentication.

### 2.4 Trade Secret & Internal Data Leakage Defense
- **Vulnerability Mitigated**: Exposure of ingredient purchase costs (`cost`), recipe formulations, supplier information, and margin percentages.
- **Implementation**: `menuController.js` projects customer-safe DTOs, stripping `cost` and internal flags.

### 2.5 Anti-Enumeration Password Recovery
- **Vulnerability Mitigated**: Account enumeration via forgot-password probing.
- **Implementation**: `POST /api/auth/forgot-password` returns an identical success message whether an email exists or not. Tokens are cryptographically generated using `crypto.randomBytes(32)`, stored as SHA-256 hashes with 1-hour expiration, and invalidated upon use.

### 2.6 Rate Limiting & HTTP Security Headers
- Helmet middleware enabled for secure headers.
- Rate limiting active on `/api` (100 requests per 15-minute window).
- CORS configured to allow only customer application origins with credentials.
