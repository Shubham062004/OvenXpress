# Customer Cart & Coupon Architecture

## 1. Overview
The customer cart enables customers to select food items, adjust quantities, review order types, apply coupons, and trigger checkout.

## 2. Cart Integrity Rules
1. **Branch Association**: Items in cart must belong to the active selected branch.
2. **Server Authoritative Pricing**:
   - The cart displays estimated pricing in the browser for user feedback.
   - However, during checkout / order submission, client-side pricing numbers are **completely ignored** by the server.
   - The server queries `MenuItem` prices from the database and recalculates subtotal, taxes, delivery fees, and discounts authoritatively.
3. **Availability Checks**:
   - If an item becomes unavailable between cart addition and checkout, the server rejects order creation and instructs the customer to refresh or remove the item.

## 3. Cart State Structure (`CartContext.tsx`)

```typescript
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
  notes?: string;
}

export interface AppliedCoupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description?: string;
  discountAmount: number;
}
```

## 4. Coupons Validation
- **Route**: `POST /api/coupons/validate`
- **Body**: `{ "code": "WELCOME50", "orderValue": 450 }`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "coupon": {
        "code": "WELCOME50",
        "type": "percentage",
        "value": 20,
        "maxDiscount": 100
      },
      "discount": 90
    }
  }
  ```
- **Validation**:
  - Checks coupon code existence and `active: true`.
  - Verifies current time against `expiresAt`.
  - Verifies order value exceeds `minOrderValue`.
