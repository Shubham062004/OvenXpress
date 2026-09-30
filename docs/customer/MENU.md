# Customer Menu Architecture & Data Protection

## 1. Overview
The customer menu displays delicious food items available for customer orders. To protect business trade secrets and financial integrity, customer menu endpoints project strictly customer-safe DTOs.

## 2. Protected Fields (Never Returned to Customers)
The following internal operations data are explicitly stripped:
- `cost`: Internal purchase cost of ingredients or item.
- `recipe` / `BOM`: Recipe quantities and preparation formulations.
- `supplier`: Supplier names and commercial contracts.
- `inventory`: Raw material stock quantities, warehouse locations, and wastage logs.
- `internalMargin`: Gross profit percentages.

## 3. Customer-Safe Menu DTO Projection

```typescript
interface CustomerSafeMenuItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  imageUrl: string;
  ingredients: string[];
  allergens: string[];
  nutritionalInfo: Record<string, any>;
  isAvailable: boolean;
  prepTime: number;
  isSpecial: boolean;
  isPopular: boolean;
}
```

## 4. API Endpoints

### 4.1 Browse Menu
- **Route**: `GET /api/menu?available=true&category=pizza&search=margherita`
- **Public**: Yes
- **Query Params**:
  - `available`: Filter by active availability (`true`).
  - `category`: Filter by category name.
  - `search`: Search query matching name or description.

### 4.2 Get Item Details
- **Route**: `GET /api/menu/:id`
- **Public**: Yes
- **Response**: Single item customer-safe DTO.

### 4.3 Get Categories
- **Route**: `GET /api/menu/categories`
- **Public**: Yes
- **Response**: Array of available categories (e.g. `["pizza", "pasta", "sides", "desserts"]`).
