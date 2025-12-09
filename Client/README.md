# Oven Xpress – Canonical Project Specification

Oven Xpress is a production-grade, multi-branch restaurant and food-ordering platform for customers, staff, branch managers, and founders. It covers online ordering (menu, cart, coupons, checkout), staff attendance (selfie check-in/out with timers and salary calculations), inventory management across branches, branch operations, founder-level analytics, and real-time kitchen updates, with a roadmap for ML-based demand forecasting and recommendations.[1]
The stack is: React 18 + TypeScript + Vite + Tailwind + shadcn/ui for the SPA frontend, Node.js 18 + Express + Socket.io + MongoDB (Mongoose) for the backend, Docker and AWS for deployment, and an outbox-based dual-database strategy for resilience.[2][1]

***

## 1. High-level Architecture

### 1.1 Frontend SPA

- **Tech stack**: React 18 + TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, Socket.io client, Axios, optional React Query.[1][2]
- **Structure (canonical)**:
  ```text
  frontend/
  ├─ public/
  ├─ src/
  │  ├─ assets/
  │  ├─ components/
  │  │  ├─ common/      # Navbar, Footer, Button, Modal, Avatar
  │  │  ├─ hero/        # HeroCarousel, OffersCarousel, DailyOffers
  │  │  ├─ cart/        # CartItem, CouponPopup, OrderProgress
  │  │  ├─ profile/     # ProfileCard, AddressBook, OrderHistory
  │  │  ├─ staff/       # StaffCheckin, SalaryCard
  │  │  ├─ manager/     # ManagerOrders, InventoryTable
  │  │  └─ founder/     # DashboardStats, StaffGrid
  │  ├─ pages/          # Home, Menu, Cart, Login, Signup, Profile, Staff, Inventory, Manager, Founder
  │  ├─ router/         # Route definitions, ProtectedRoute
  │  ├─ contexts/       # AuthContext, CartContext
  │  ├─ services/       # api.ts (Axios instance + API modules)
  │  ├─ hooks/          # useAuth, useCart, useSocket, useMobile, useToast
  │  ├─ utils/          # currency.ts (₹), helpers
  │  ├─ App.tsx
  │  └─ main.tsx
  ├─ tailwind.config.ts
  └─ vite.config.ts
  ```

- **State & server state**:
  - Auth and cart via React Contexts.[3][1]
  - Network via Axios with interceptors and optional React Query.[4]

### 1.2 Backend API

- **Tech stack**: Node.js 18+, Express, Mongoose, Socket.io, JWT, bcrypt, Helmet, CORS, express-rate-limit, Joi/Zod.[5][2][1]
- **Structure (canonical)**:
  ```text
  backend/
  ├─ src/
  │  ├─ config/        # dbPrimary, dbBackup, dualSync, env
  │  ├─ models/        # User, MenuItem, Order, Coupon, Inventory, Attendance, SalaryLog, Outbox
  │  ├─ controllers/   # auth, order, menu, staff, inventory, manager, founder, analytics, coupon
  │  ├─ routes/        # authRoutes, orderRoutes, menuRoutes, staffRoutes, inventoryRoutes, managerRoutes, founderRoutes, couponRoutes
  │  ├─ middleware/    # auth, rbac, validate, upload, errorHandler, rateLimiter
  │  ├─ services/      # syncService, salaryService, analyticsService, notificationService, uploadService, couponService
  │  ├─ sockets/       # orderSocket, staffSocket
  │  ├─ jobs/          # analyticsJob, backupSyncJob, birthdayJob
  │  ├─ workers/       # outboxWorker
  │  ├─ utils/         # logger, idempotency, responseHandler, tokenUtils
  │  ├─ app.ts/js
  │  └─ server.ts/js
  ├─ .env.example
  └─ ecosystem.config.js   # PM2 config
  ```

- **Key backend characteristics**:
  - Monolithic API with clean separation by domain in controllers/services.[1]
  - JWT-based auth and role-based middleware (customer, staff, manager, founder/owner).[6][5][1]
  - Socket.io used for real-time kitchen and inventory updates.[7][5][1]

### 1.3 Databases, Storage, Workers

- **Databases**:
  - Primary MongoDB cluster: main OLTP database (Users, Orders, MenuItems, Coupons, Inventory, Attendance, SalaryLogs, Outbox).[1]
  - Backup MongoDB cluster: updated using an outbox pattern and worker process for resilience.[1]

- **File storage**:
  - S3 (or similar) for images and selfies, with signed URL uploads, encryption at rest, and lifecycle rules for retention (e.g., 90 days for staff selfies).[2][1]

- **Workers & jobs**:
  - Outbox worker: replays writes to backup DB.  
  - Analytics jobs: nightly aggregations for founder dashboard.  
  - Birthday job: generates birthday offers/coupons based on user DOB.[1]

### 1.4 Monitoring, CI/CD, Security

- **Monitoring**:
  - Dev: console logs at major steps.  
  - Prod: logger (pino/winston) with correlation IDs, Sentry for exceptions, Prometheus + Grafana for metrics.[5][1]

- **CI/CD**:
  - GitHub Actions for lint/test/build.  
  - Deploy frontend to Vercel or S3+CloudFront; backend to Render/Railway or Dockerized EC2 with PM2.[8][9][2][1]

- **Security**:
  - Helmet, CORS, rate-limiting on `/api/`, bcrypt for passwords.[2][5]
  - JWT access tokens (short-lived) + httpOnly refresh cookies.  
  - Strict env-based secrets (no hardcoded DB URI, no fallback JWT secret).[10][6][1]

***

## 2. Core Pages & UI Behavior

### 2.1 Global UI Rules

- Currency: **₹ (Indian rupees)** everywhere (menu, cart, analytics).[1]
- Theme: earthy tones with a warm orange `#ee7c2b` and deep red `#8a2828` gradient for primary CTAs (e.g., `bg-gradient-warm`).  
- Navbar behavior:
  - At top: transparent with white text.  
  - On scroll: solid background (white) with dark text.  
  - On scroll back to top: revert to transparent/white text. [file:87cdeb10-3704-4424-8583-5d2f231223d0][1]

- Accessibility:
  - Buttons and controls keyboard navigable, proper ARIA attributes.  
  - Mobile-first layout with tailwind responsive utilities.[2][1]

### 2.2 Hero & Landing Page (`/`)

- Hero carousel section: “Today’s Specials” slides with image, name, ₹ price, and CTAs:
  - “Order Now” (primary gradient button).  
  - “View Full Menu” (secondary button). [file:5f922cd3-ecda-4458-81a9-1492dd6be5da][file:86f7921b-a1c3-4981-ba90-777dcd797df5][1]

- Additional sections:
  - Offers carousel, daily offers, data insights, problem-solver/FAQ, live kitchen analytics preview. [file:79561f6a-c89b-4b78-aaa9-d1825ae18a69][file:090deac6-c735-48a7-a57f-b9dda2c8a6d3][1]

### 2.3 Navbar & Cart Behavior

- Navbar:
  - Shows logo, navigation links, and Cart icon with item count badge; on small screens a hamburger menu. [file:87cdeb10-3704-4424-8583-5d2f231223d0]  
  - Auth:
    - Logged-out: “Login” and “Signup” buttons.  
    - Logged-in: avatar with dropdown: Profile, Staff/Manager/Founder Dashboard (based on role), Logout.[3]

- Cart indicator:
  - If cart empty: “Order Now” CTA linking to menu.  
  - If cart has items: “Cart (N)” near the icon. [file:a8df9b6f-c5d4-49a4-a592-e616f91eef29][1]

### 2.4 Menu Page (`/menu`)

- Menu listing:
  - Categories (starters, mains, desserts, beverages, specials).  
  - Item cards: image, name, description, ₹ price, Veg/Vegan badge, spice level, nutritional info, “Add to Cart”. [file:deaed881-4ff6-9ec6-9169387f5371][file:fbc299b6-73bb-4070-9311-2e4807bf5040][1]

- Filters & search:
  - Category filters, search bar (name/description), specials flag. [file:deaed881-4ff6-9ec6-9169387f5371][1]

### 2.5 Cart Page (`/cart`)

- Components:
  - Cart item list with quantity controls. [file:ea44593e-f61f-46e0-a2e2-2b8ab53c14d1]  
  - Offers carousel above coupon input listing active coupons; clicking an offer pre-fills the coupon input.[1]

- Coupon UX:
  - Input field + “Apply” button.  
  - On success: popup with confetti and fun emojis, e.g., “Coupon applied — enjoy ₹X off! 🥳🎉” plus close button. [file:9d7d528b-caa4-4712-a959-cdf0bc4aae0a][file:c7a1c909-0fe3-4be8-8807-0a4eef012ce2][1]
  - On failure: accessible toast with reason (expired, min order not met, limit reached, invalid). [file:6c6e9fda-da35-4cc1-976e-bf381744eb61]

- Order type & fees:
  - Radio buttons: Dine-in / Take-away / Delivery (+₹20). [file:ea44593e-f61f-46e0-a2e2-2b8ab53c14d1]  
  - Delivery automatically adds fee; totals show subtotal, GST, delivery fee, coupon discount, final total.

- Status UI:
  - After placing an order, show status progression: Preparing → Ready → Out for Delivery with an animated progress bar, updated via websocket events. [file:24ff3b86-3b62-416b-8c37-df4232f49f67][file:4ef75723-79d9-4c67-aeb8-e17690cfb065][1]

### 2.6 Profile Page (`/profile`)

- Sections:
  - Profile card with editable photo, name, phone, email. [file:ee8bf585-2d8c-449d-be8e-4a74244f1623]  
  - Address book: multiple addresses with labels (Home, Work) and default flag.  
  - Your Orders: list of past orders with “Reorder” shortcut.  
  - Wishlist and notifications.  
  - Theme toggle (light/dark).  
  - Birthday field for “Free cake on orders > ₹2000” offers; store DOB securely.[1]
  - Settings block: Privacy, About Us, T&C, Notifications settings, Logout. [file:ee8bf585-2d8c-449d-be8e-4a74244f1623][1]

- Staff entry:
  - Staff button visible if user has staff/manager/founder role; navigates to `/staff`. [file:ee8bf585-2d8c-449d-be8e-4a74244f1623]

### 2.7 Staff Page (`/staff`)

- Check-in/out:
  - “Check In” button starts flow: camera/selfie upload and optional geolocation request. [file:b2c06b92-fa1a-435b-b5d8-d71d02173a9b]  
  - After check-in: button switches to “Check Out”, timer shows hh:mm elapsed.  
  - On check-out: timer stops; send checkOutTime to server; server calculates `hoursWorked`.

- Salary & points:
  - Card showing monthly salary in big font.  
  - Under it an equation: “Fixed Salary − Leaves + Points = Salary” with numeric breakdown. [file:360a456d-d339-4f56-af33-691247a23b24][1]
  - Attendance history and assigned tasks list.

- Privacy:
  - Info about selfie retention (e.g., 90 days) and ability to request deletion.[1]

### 2.8 Inventory Page (`/inventory`)

- UI:
  - Master list of raw materials with columns: name, category, unit, currentStock, minimumStock, pricePerUnit, supplier. [file:9e2bfb8f-1a5a-4ed6-a194-d92b9b337598]  
  - Forms:
    - Record received stock (supplier, qty, date).  
    - Send-to-branch: choose branchId, qty; updates distributions.  
    - View branch requests and approve.[1]

- Logs:
  - Daily logs per item: date, received, sent, wasted; filters by date and branch.  
  - Export options (CSV/PDF) for reporting.

### 2.9 Branch Manager Page (`/manager/branch:id`)

- Branch operations:
  - View today’s online and offline orders; update order status (preparing/out for delivery/delivered). [file:0bdddbc8-b03f-4d27-a57a-f00174d6a018]  
  - Create offline orders (cash or staff QR) and log payment method.  
  - Record received stock quantities and EOD requests for next day.

- Staff interactions:
  - View staff check-ins for branch; mark check-in manually if staff had technical issues. [file:360a456d-d339-4f56-af33-691247a23b24][1]

- Menu change proposals:
  - CRUD operations for menu items in branch scope; on save, proposals sent to founder for approval (not applied until approved).[1]

### 2.10 Founder Page (`/founderr`)

- Dashboard:
  - Top metrics: total orders + per-branch split, e.g. `branch1 50 | branch2 100 | branch3 51 | branch4 90`, and total sales like `₹152,150`. [1][file:31367533-59e6-4526-b3f1-755a269433e0]  
  - Charts for weekly, monthly, yearly analytics.

- Sidebar with single-word labels:
  - Dashboard, Managers, Staff, RawInventory, Menu, Offers, Reports, Settings.[1]

- Management tools:
  - Staff: salary adjustments, bank/UPI details, points, leaves, daily work logs.  
  - RawInventory: P&L, raw material CRUD, pricing.  
  - Menu: global add/edit/delete, and approval for branch menu change requests.  
  - Offers & coupons: schedule start/stop, define conditions.

- Extras:
  - Text marquee animation for long texts (e.g., important notices) if width exceeds container.[1]

***

## 3. Backend Detailed Design

### 3.1 Key Principles

- **RBAC**: roles = `customer`, `staff`, `manager`, `founder`. Middleware enforces role-based access.[1]
- **Security-first**: no DB credentials or JWT secrets in code; no sensitive fields inside JWT; short-lived access tokens and refresh tokens in httpOnly cookies.[6][10][1]
- **Resilience**: outbox pattern for Primary → Backup DB sync.[1]
- **Idempotency**: idempotency keys in order creation and payment webhooks to avoid duplicate side effects.[1]

### 3.2 Main Services

- **Auth service**:
  - Registration, login, refresh, logout, password reset.  
  - Generates access token (short TTL) and refresh token (stored in cookie, rotating with revoke list).[3][6][1]

- **User service**:
  - Profile read/update, address book CRUD, wishlist endpoints.[6][1]

- **Menu service**:
  - CRUD menu items, search, filter, specials, toggling availability.[11][1]

- **Order service**:
  - Validate items (available, in stock), compute pricing:  
    `subtotal + GST (e.g. 18%) + deliveryFee - couponDiscount = total`.[1]
  - Save order, update status history, emit Socket.io events `new_order` and `order_status_update`.[7][5][1]

- **Coupon service**:
  - Validate code for min order value, expiry, usage limit, branch restrictions; compute discount for UI.[1]

- **Inventory service**:
  - Receive stock, send stock to branch, log daily activity, handle branch requests, and low stock alerts (socket).[1]

- **Staff & attendance service**:
  - Selfie-based check-in/out, compute hours worked, accumulate points, and push data to SalaryLog.[1]

- **Founder & analytics service**:
  - Aggregate daily/weekly/monthly metrics (orders, revenue, staff performance, inventory costs).  
  - Provide endpoints for founder dashboard.[12][1]

- **Upload service**:
  - S3 signed URL generation, verifying ownership and permissions; optional direct multipart uploads. [file:6e3a593f-2ef2-468b-93a0-f0c9eeb734e3][2]

- **Sync service (Outbox)**:
  - Writes outbox entries for mirrored operations; worker reads and applies to backup DB with retries.[1]

### 3.3 Outbox Pattern

- **Outbox document**:
  - `{ _id, operation, collection, payload, idempotencyKey, status, attempts, lastAttemptAt, createdAt }`.[1]

- **Flow**:
  1. On critical write:
     - Write main document in primary DB.  
     - Write outbox entry as part of same logical operation (transaction if possible).  
  2. Worker reads `status: 'pending'` entries:
     - Applies operation to backup DB; uses `idempotencyKey` to ensure each logical write is processed once.  
     - On success: marks `status: 'done'`.  
     - On repeated failures: moves to failure/DLQ and logs/alerts.[1]

### 3.4 Real-time with Socket.io

- **Authentication**:
  - Client passes JWT token via `auth` during socket connection; server verifies and attaches user.[13][5]

- **Rooms**:
  - `kitchen` – kitchen display.  
  - `branch_{id}` – branch-specific updates.  
  - `user_{id}` – individual customer notifications.  
  - `founder` – founder-level alerts.

- **Events**:
  - `join_room` – client requests joining rooms based on role/branch; server handles join logic.[13][5]
  - `new_order` – emitted on order creation to kitchen and relevant branch.[7]
  - `order_status_update` – emitted on status changes for user and branch.[7]
  - `low_stock_alert` – when inventory passes threshold, to relevant managers.[1]

### 3.5 Background Jobs

- **AnalyticsJob**: daily rollups of orders, revenue, staff hours, inventory changes.[1]
- **BackupSyncJob**: verifies backup sync health and outbox backlog; raises alerts on anomalies.[1]
- **BirthdayOfferJob**: creates coupons/offers for upcoming birthdays.

### 3.6 File Uploads & Selfies

- **Flow**:
  - Client calls an endpoint like `POST /api/upload/signed-url` with file metadata.  
  - Server validates, returns S3 signed URL; client uploads directly to S3. [file:6e3a593f-2ef2-468b-93a0-f0c9eeb734e3][2]
  - Attendance record stores selfie metadata: URL, uploadedAt, optional location.[1]

- **Retention**:
  - S3 lifecycle configuration to delete selfies after ~90 days.  
  - Deletion endpoint to remove reference and optionally trigger S3 deletion ahead of schedule.

***

## 4. Database Schemas (Overview)

### 4.1 User

Key fields:  
`_id`, `name`, `email` (unique), `passwordHash`, `phone`, `role` (`customer|staff|manager|founder`), `branch` (number or null), `profileImage`, `addresses[]`, `birthday`, `preferences`, `isActive`, `createdAt`, `updatedAt`. [1][2][file:631a7d8e-22df-4818-9781-235468bd127c]

### 4.2 MenuItem

Key fields:  
`_id`, `name`, `description`, `category`, `price`, `cost`, `imageURL`, `ingredients[]`, `allergens[]`, `nutritionInfo`, `prepTime`, `isSpecial`, `isAvailable`, `spiceLevel`, `rating`, `orderCount`, `createdBy`, timestamps. [file:3e47f584-4b5f-4e38-8fce-1bdc19b7c253][1]

### 4.3 Order

Key fields:  
`_id`, `orderNumber`, `customer` (ref User), `items[]` (menuItemId, name, price, quantity, instructions), `orderType` (dine-in/takeaway/delivery), `deliveryAddress`, `pricing` (`subtotal`, `gst`, `deliveryFee`, `couponDiscount`, `total`), `status`, `statusHistory[]`, `branch`, `assignedTo`, `paymentDetails`, `estimatedDeliveryTime`, timestamps. [file:af6f441f-1861-4004-b343-fba12b848bc4][7][1]

### 4.4 Coupon

Key fields:  
`code`, `type` (percentage/fixed), `value`, `description`, `minOrderValue`, `maxDiscount`, `usageLimit`, `usedCount`, `validFrom`, `validUntil`, `createdBy`, `isActive`. [file:70c85f5b-c1a0-4aaf-9633-e8d042bef613][1]

### 4.5 Inventory

Key fields:  
`_id`, `name`, `category`, `unit`, `currentStock`, `minimumStock`, `pricePerUnit`, `supplier`, `branchDistribution[]`, `dailyLog[]`, `createdBy`.[1]

### 4.6 Attendance & Salary

- **Attendance**: `_id`, `staff` (User), `date`, `checkInTime`, `checkOutTime`, `hoursWorked`, `status`, `checkInSelfieURL`, `location`, `notes`.[1]
- **SalaryLog**: `staffId`, `month`, `points`, `fixedSalary`, `leaves`, `adjustments`, `finalSalary`, `breakdown`.[1]

### 4.7 Outbox

Key fields:  
`_id`, `operation`, `collection`, `payload`, `idempotencyKey`, `status`, `attempts`, `lastAttemptAt`, `createdAt`.[1]

***

## 5. API Design Summary (Core Endpoints)

Small set of primary endpoints (can be refined into OpenAPI later):

- **Auth**:
  - `POST /api/auth/register` – register user.[6][2]
  - `POST /api/auth/login` – login, returns access token and sets refresh cookie.[6][1]
  - `POST /api/auth/refresh` – refresh access token (httpOnly cookie).  
  - `POST /api/auth/logout` – revoke refresh token.  
  - `GET /api/auth/profile` – current user profile (protected).[14][6][2]

- **Menu**:
  - `GET /api/menu` – menu list with filters (`category`, `q`).[11][2]
  - `GET /api/menu/:id` – item details.[11][2]
  - `GET /api/menu/categories` – distinct categories.[11][2]
  - `GET /api/menu/featured` – specials.[11][2]
  - `POST /api/menu` – create (founder/manager).  
  - `PUT /api/menu/:id` – update.  
  - `DELETE /api/menu/:id` – delete.[11]

- **Orders**:
  - `POST /api/orders` – create order (protected, header `Idempotency-Key`).[7][2]
  - `GET /api/orders` – list user’s orders.[2][7]
  - `GET /api/orders/:id` – order details (owner or admin).[7]
  - `PUT /api/orders/:id/status` – update status (staff/manager/founder).[15][2][7]

- **Coupons**:
  - `POST /api/coupons/apply` – validate/apply coupon for a given cart.[1]

- **Staff**:
  - `POST /api/staff/checkin` – selfie check-in.  
  - `POST /api/staff/:id/checkout` – check-out.  
  - `GET /api/staff/:id/attendance` – attendance history.

- **Inventory**:
  - `GET /api/inventory` – list items.  
  - `POST /api/inventory/receive` – record received stock.  
  - `POST /api/inventory/send` – send to branch.  
  - `POST /api/inventory/request` – branch request.

- **Founder & analytics**:
  - `GET /api/founder/summary` – top-line metrics.[12][1]
  - `GET /api/founder/menu-requests` – pending menu edits from branches.  
  - `POST /api/founder/menu-requests/:id/approve` – apply edit.  
  - `POST /api/founder/menu-requests/:id/reject` – reject edit.

- **Health**:
  - `GET /health` – app health and DB statuses.[5][2]

***

## 6. Implementation Plan (Step-by-step)

Below is a practical sequence you can follow. Do them one by one.

### Phase 0 – Setup

1. **Initialize repos and structure**
   - Create `frontend/` and `backend/` directories and align with the folder structures above, taking cues from your existing OvenXpress repo.[2][1]

2. **Git & environment**
   - Run `git init`, add `.gitignore` to ignore `node_modules`, `dist`, `.env`.  
   - Create `backend/.env.example` and `frontend/.env.example` with all required keys (DB URI, JWT secrets, S3, VITE_API_URL, VITE_SOCKET_URL).[2]

### Phase 1 – Backend Core (Auth, Menu, Orders)

3. **Express app + DB connection**
   - In `backend/src/app.ts`, configure Express with JSON body parsing, Helmet, CORS (allow frontend origin), compression, logging, and global error handler.[5][2]
   - Implement `config/dbPrimary` using `process.env.MONGODB_URI` (no hardcoded string) and call it before server starts.[10][1]

4. **User model & auth routes**
   - Port or adapt your `User` model (with roles, branch, addresses, birthday, preferences). [file:631a7d8e-22df-4818-9781-235468bd127c][1]
   - Implement auth routes (`register`, `login`, `refresh`, `logout`, `profile`) with JWT access tokens and refresh cookies.[14][6][1]

5. **Menu model & controller**
   - Adapt `MenuItem` schema with specials, ratings, nutrition. [file:3e47f584-4b5f-4e38-8fce-1bdc19b7c253][1]
   - Implement `GET` menu endpoints and admin-only CRUD.[11][2]

6. **Order model & controller**
   - Build `Order` schema for items, pricing, and status tracking. [file:af6f441f-1861-4004-b343-fba12b848bc4][1]
   - Implement create, list, get-by-id, and status update endpoints, plus emit Socket.io events on create and status change.[5][7]

7. **RBAC middleware**
   - Implement middlewares `protect` and `authorize(...roles)` based on JWT and `req.user.role`. [file:50785f0d-0c5f-4193-bf1f-efaa555cc524][5][1]

### Phase 2 – Frontend Core (Auth, Menu, Cart)

8. **Scaffold React app**
   - Use Vite React + TS template (your existing Client/ structure can be reused).[2]
   - Configure Tailwind and shadcn according to your current setup. [file:46e00458-1850-45b3-8fa3-c625ed8d6d91][file:b32de9d2-50f7-48cd-b3dc-b403ee0019fe]

9. **Router & layout**
   - Setup routes: `/`, `/menu`, `/cart`, `/login`, `/signup`, `/profile`. [file:ae7d4d84-d437-4dd8-a8bd-e12d415e1155]  
   - Integrate `Navbar`, `Footer`, `ErrorBoundary`, and `OfflineBanner`. [file:87cdeb10-3704-4424-8583-5d2f231223d0][file:5a995a7e-b67e-4e21-ac6f-67f3935ac31b][file:de8c47e6-fb24-4a34-bf2e-936cc1ff50f4][file:12f3de6b-e11b-44d9-805b-10a0c61eeee7]

10. **Auth wiring**
    - Ensure `authAPI` uses `/api/auth/login`, `/api/auth/register`, `/api/auth/profile`, `/api/auth/logout`, `/api/auth/refresh`.[4]
    - Use `AuthContext` to manage token/user as in your current implementation, but align response shape.[3]

11. **Menu & cart**
    - Wire `menuAPI` to backend menu routes; integrate menu UI components. [file:deaed881-4ff6-9ec6-9169387f5371][4]
    - Use `CartContext` to handle cart operations, apply order types and simple coupon logic (even mocked at first). [file:a8df9b6f-c5d4-49a4-a592-e616f91eef29][file:ea44593e-f61f-46e0-a2e2-2b8ab53c14d1]

12. **Place order flow**
    - Implement “Place order” button posting to `/api/orders`, then show local order status page which will later subscribe to Socket.io updates. [file:ea44593e-f61f-46e0-a2e2-2b8ab53c14d1]

### Phase 3 – Staff, Inventory, Manager, Founder

13. **Staff & attendance backend**
    - Add `Attendance` model and check-in/out endpoints.[1]
    - Integrate basic selfie upload (local storage for dev, move to S3 later).

14. **Staff page UI**
    - Implement `/staff` page logic: call check-in/out endpoints, show timer, daily points, and monthly salary card. [file:b2c06b92-fa1a-435b-b5d8-d71d02173a9b][file:360a456d-d339-4f56-af33-691247a23b24]

15. **Inventory backend & UI**
    - Implement inventory APIs and wire `/inventory` page to list materials, process receive/send forms, and show logs. [file:9e2bfb8f-1a5a-4ed6-a194-d92b9b337598][1]

16. **Branch manager & founder**
    - Add manager and founder routes for branch-specific orders, offline orders, approvals, and analytics summary. [file:e28d0c0d-30b0-422d-8931-e745261e07b1][1]
    - Wire `/manager/branch:id` and `/founderr` pages to these APIs. [file:0bdddbc8-b03f-4d27-a57a-f00174d6a018][file:31367533-59e6-4526-b3f1-755a269433e0]

### Phase 4 – Real-time, Outbox, Reliability

17. **Socket.io integration**
    - Align `useSocket` with backend: implement `join_room` handler and join proper rooms based on role/branch.[13][5]
    - Emit `new_order` and `order_status_update` from order controller.[7]

18. **Outbox & backup DB**
    - Create Outbox model and write entries for critical operations (orders, inventory).[1]
    - Implement worker script that pulls pending entries and writes them to backup DB.

19. **Monitoring**
    - Add structured logging with correlation IDs and health checks for primary/backup DB.[5][1]

### Phase 5 – Polish, Testing, Deployment

20. **UX polish**
    - Finalize hero, gradient buttons, nav scroll behavior, text marquee, coupon confetti, and dark/light theme. [file:5f922cd3-ecda-4458-81a9-1492dd6be5da][file:9d7d528b-caa4-4712-a959-cdf0bc4aae0a][1]

21. **Testing**
    - Add unit tests for coupons, inventory, salary calculations; integration tests for auth and orders; E2E for checkout and staff check-in. [file:83e0627e-5522-47ea-a319-2ecf61908e35][file:6b406e64-45f6-445c-8a41-cd2bc7eb1903][1]

22. **Docker & AWS**
    - Use `docker-compose.yml` for local multi-service dev, and your existing deployment scripts (CloudFormation, deploy.sh, PM2 ecosystem). [file:fb2c775c-69b1-4ae2-b377-89b7b2fc0340][9][16][8][2]
    - Configure secrets via environment variables or AWS Secrets Manager.

***
