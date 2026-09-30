# Customer Orders & Tracking Documentation

## 1. Overview
The orders domain governs order placement, server-side pricing computation, customer order history, and real-time order status tracking.

## 2. Order Lifecycle & Statuses

Customer-visible statuses are mapped to clean, understandable customer phases:

```
[ ORDER_PLACED ]  -->  Customer completed checkout
       │
       ▼
[ CONFIRMED ]     -->  Branch kitchen acknowledged order
       │
       ▼
[ PREPARING ]     -->  Food baking in oven / kitchen preparation
       │
       ▼
[ READY ] / [ OUT_FOR_DELIVERY ]  -->  Packaged for pickup or dispatched with delivery rider
       │
       ▼
[ COMPLETED ]     -->  Successfully received by customer
```

If rejected or cancelled by branch or customer:
`[ CANCELLED ]`

## 3. API Endpoints

### 3.1 Place Customer Order
- **Route**: `POST /api/orders`
- **Auth**: Protected (Customer JWT)
- **Body**:
  ```json
  {
    "items": [
      { "id": "67...01", "quantity": 2, "notes": "Extra crispy" }
    ],
    "orderType": "DELIVERY",
    "deliveryAddress": {
      "line1": "42 Baker Street",
      "city": "Mumbai",
      "pincode": "400001"
    },
    "couponCode": "OVEN10",
    "specialInstructions": "Please ring bell once",
    "paymentMethod": "CASH"
  }
  ```
- **Authoritative Server Actions**:
  1. Validates all item IDs against `MenuItem` collection in MongoDB.
  2. Ensures all items have `isAvailable === true`.
  3. Pulls DB price per item: `subtotal = sum(dbPrice * quantity)`.
  4. Computes GST: `Math.round(subtotal * 0.05)`.
  5. Computes Delivery Fee: ₹40 if `DELIVERY`, else ₹0.
  6. Validates `couponCode` against `Coupon` collection and computes discount.
  7. Calculates `total = subtotal + gst + deliveryFee - discount`.
  8. Emits real-time event to branch room `branch_${branch}` for kitchen display.

### 3.2 Customer Order History
- **Route**: `GET /api/orders/my-orders`
- **Auth**: Protected (Customer JWT)
- **Security**: IDOR protected. Queries orders where `customer === req.user.id`.

### 3.3 Customer Order Details
- **Route**: `GET /api/orders/:id`
- **Auth**: Protected (Customer JWT)
- **Security**: IDOR protected. Resolves either `_id` or `orderNumber` strictly scoped to `customer === req.user.id`.

## 4. Reorder Workflow
Customers can click "Reorder" from the order history or details page. The client populates the cart with previous items and verifies live availability and refreshed prices on checkout.
