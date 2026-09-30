# Oven Xpress — Customer Branch Discovery & Location Architecture

## Overview
The Oven Xpress Customer Application (`OvenXpress`) now connects directly to the authoritative Neon PostgreSQL database shared with the `Oven_Xpress` operations platform.

All branch operations, menu availability, and kitchen fulfillment are anchored on the selected branch.

---

## 1. Authoritative Branch Schema
The branches are queried from the shared PostgreSQL `"Branch"` table:
- `id` (text, primary key)
- `name` (text, e.g. "Bandra West Flagship", "Downtown Central")
- `code` (text, unique code)
- `address`, `city`, `state`, `postalCode`
- `phone`, `email`
- `openingTime`, `closingTime`
- `status` (`'ACTIVE'` | `'INACTIVE'`)

---

## 2. API Endpoints
All branch discovery endpoints are public:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/branches` | Lists all active branches (filterable by `city` and `search`) |
| `GET` | `/api/branches/:id` | Returns branch profile and operating status |
| `GET` | `/api/branches/cities` | Returns distinct active cities (e.g. Mumbai, Bengaluru, New Delhi) |

---

## 3. Branch Selection & Persistence
- **Client Context**: `BranchContext.tsx` maintains `selectedBranch` in React state and automatically synchronizes to `localStorage` (`ovenxpress_selected_branch`).
- **Navbar Selector**: Quick location pill in the navigation header displays the selected branch and opens `BranchSelectorModal` on click.
- **Dedicated Discovery Page**: `/branches` offers full-page search, city filtering, opening hours, and one-click "Order from this branch".

---

## 4. Multi-Branch Cart Conflict Protection
A customer can only order from a single branch per order:
1. `CartContext.tsx` tracks `branchId` and `branchName` alongside items.
2. If a customer attempts to add an item from Branch B while their cart contains items from Branch A:
   - The UI surfaces a confirmation dialog.
   - The customer can choose to keep their current cart or clear the cart and switch to the new branch.
3. When checking out, `branchId` is sent with `POST /api/orders` and recorded in the database.

---

## 5. Live Operations Visibility
When an order is created:
- It is saved directly into the PostgreSQL `"Order"` and `"OrderItem"` tables.
- A real-time Socket.IO event `new_order` is emitted to room `branch_${branchId}`.
- Kitchen display systems (KDS) and branch managers in `Oven_Xpress` receive the order instantly.
