# Customer Payment Architecture & Security

## 1. Supported Payment Methods
The customer application supports four canonical payment methods:
- `CASH`: Cash on Delivery or Pay at Counter.
- `UPI`: Unified Payments Interface intent / QR.
- `CARD`: Credit / Debit card processing.
- `ONLINE`: Integrated gateway (e.g. Stripe / Razorpay).

## 2. Security Invariants

### 2.1 No Client-Controlled Payment Status
- The client can **never** send `paymentStatus: "PAID"` to set an order as completed or paid.
- All newly placed orders receive `paymentStatus: "PENDING"`.
- Updates to `PAID` occur strictly via trusted backend server hooks, verified gateway webhooks, or authorized operations cashier entries in `Oven_Xpress`.

### 2.2 Zero Sensitive Card Storage
- The application never receives, logs, or stores raw credit card numbers, CVVs, expiration dates, or banking PINs.
- Sensitive payment tokens are handled exclusively via verified PCI-compliant payment gateways.

### 2.3 Idempotency & Reconciliation
- Online payments are verified server-side with gateway signature validation before receipt generation.
