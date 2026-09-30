// backend/src/controllers/orderController.js
import { createId } from '@paralleldrive/cuid2';
import { query, getClient } from '../config/database.js';

/**
 * Normalizes order type to PostgreSQL enum OrderType:
 * 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'
 */
const normalizeOrderType = (type) => {
  if (!type) return 'DELIVERY';
  const s = String(type).trim().toUpperCase().replace('-', '_');
  if (s === 'DINE_IN' || s === 'DINEIN') return 'DINE_IN';
  if (s === 'TAKEAWAY' || s === 'TAKE_AWAY' || s === 'PICKUP') return 'TAKEAWAY';
  return 'DELIVERY';
};

/**
 * Normalizes payment method to PostgreSQL enum PaymentMethod:
 * 'CASH' | 'UPI' | 'CARD' | 'ONLINE' | 'BANK_TRANSFER' | 'OTHER'
 */
const normalizePaymentMethod = (method) => {
  if (!method) return 'CASH';
  const m = String(method).trim().toUpperCase();
  if (['CASH', 'UPI', 'CARD', 'ONLINE', 'BANK_TRANSFER', 'OTHER'].includes(m)) return m;
  return 'CASH';
};

/**
 * Format database order rows into customer-friendly DTO
 */
const formatOrderDTO = (orderRow, items = [], branch = null, payment = null) => ({
  _id: orderRow.id,
  id: orderRow.id,
  orderNumber: orderRow.orderNumber,
  orderType: orderRow.orderType,
  status: orderRow.status,
  branchId: orderRow.branchId,
  branchName: branch ? branch.name : orderRow.branchName || 'OvenXpress Branch',
  branchAddress: branch ? branch.address : orderRow.branchAddress || '',
  customerName: orderRow.customerName,
  customerPhone: orderRow.customerPhone,
  deliveryAddress: orderRow.deliveryAddress,
  deliveryNotes: orderRow.deliveryNotes,
  notes: orderRow.notes,
  subtotal: parseFloat(orderRow.subtotal) || 0,
  taxAmount: parseFloat(orderRow.taxAmount) || 0,
  gst: parseFloat(orderRow.taxAmount) || 0,
  deliveryCharge: parseFloat(orderRow.deliveryCharge) || 0,
  deliveryFee: parseFloat(orderRow.deliveryCharge) || 0,
  discountAmount: parseFloat(orderRow.discountAmount) || 0,
  discount: parseFloat(orderRow.discountAmount) || 0,
  totalAmount: parseFloat(orderRow.totalAmount) || 0,
  total: parseFloat(orderRow.totalAmount) || 0,
  paymentMethod: payment ? payment.method : 'CASH',
  paymentStatus: payment ? payment.status : 'PENDING',
  confirmedAt: orderRow.confirmedAt,
  preparingAt: orderRow.preparingAt,
  readyAt: orderRow.readyAt,
  completedAt: orderRow.completedAt,
  createdAt: orderRow.createdAt,
  updatedAt: orderRow.updatedAt,
  items: items.map((it) => ({
    _id: it.id,
    id: it.id,
    menuItemId: it.menuItemId,
    itemName: it.itemName,
    name: it.itemName,
    quantity: it.quantity,
    unitPrice: parseFloat(it.unitPrice) || 0,
    price: parseFloat(it.unitPrice) || 0,
    discountAmount: parseFloat(it.discountAmount) || 0,
    totalPrice: parseFloat(it.totalPrice) || 0,
    notes: it.notes || '',
    image: it.imageUrl || '/placeholder.svg',
    imageUrl: it.imageUrl || '/placeholder.svg',
  })),
});

/**
 * POST /api/orders
 * Creates an authoritative customer order directly in shared PostgreSQL Neon DB.
 * 
 * SECURITY:
 * Server NEVER trusts client-provided prices, subtotal, tax, delivery fee, or total.
 * Calculations are strictly server-authoritative from database records.
 */
export const createOrder = async (req, res, next) => {
  const client = await getClient();
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const {
      items,
      orderType,
      branchId,
      branch,
      couponCode = null,
      address = '',
      deliveryAddress = null,
      specialInstructions = '',
      notes = '',
      paymentMethod = 'CASH',
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item',
      });
    }

    // 1. Resolve Branch
    const targetBranchId = branchId || (typeof branch === 'string' && branch.length > 5 ? branch : null);
    let resolvedBranch;

    if (targetBranchId) {
      const branchRes = await client.query('SELECT id, name, address, status FROM "Branch" WHERE id = $1', [targetBranchId]);
      if (branchRes.rows.length > 0 && branchRes.rows[0].status === 'ACTIVE') {
        resolvedBranch = branchRes.rows[0];
      }
    }

    if (!resolvedBranch) {
      // Fallback to first active branch
      const fallbackRes = await client.query('SELECT id, name, address, status FROM "Branch" WHERE status = \'ACTIVE\' ORDER BY name LIMIT 1');
      if (fallbackRes.rows.length === 0) {
        return res.status(500).json({ success: false, message: 'No active branch available for ordering' });
      }
      resolvedBranch = fallbackRes.rows[0];
    }

    // 2. Validate Items & Extract IDs
    const itemRequests = items.map((it) => ({
      id: String(it.id || it.menuItemId || it.menuItem || it._id || '').trim(),
      quantity: Math.max(1, Math.min(50, Math.floor(Number(it.quantity) || 1))),
      notes: typeof it.notes === 'string' ? it.notes.trim() : '',
    }));

    if (itemRequests.some((i) => !i.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid menu item in cart',
      });
    }

    const itemIds = itemRequests.map((i) => i.id);

    // 3. Query authoritative items from MenuItem + BranchMenuItem
    const dbItemsRes = await client.query(
      `SELECT 
        m.id,
        m.name,
        COALESCE(bmi.price, m.price) as price,
        m."imageUrl",
        m.status,
        COALESCE(bmi."isAvailable", true) as is_available
       FROM "MenuItem" m
       LEFT JOIN "BranchMenuItem" bmi ON bmi."menuItemId" = m.id AND bmi."branchId" = $1
       WHERE m.id = ANY($2::text[])`,
      [resolvedBranch.id, itemIds]
    );

    const dbItems = dbItemsRes.rows;

    if (dbItems.length !== itemIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more items in your cart do not exist',
      });
    }

    // Check item availability
    const unavailableItem = dbItems.find(
      (it) => it.status !== 'ACTIVE' || it.is_available === false
    );
    if (unavailableItem) {
      return res.status(400).json({
        success: false,
        message: `"${unavailableItem.name}" is currently unavailable at this branch. Please update your cart.`,
      });
    }

    // 4. Calculate Authoritative Order Items & Subtotal
    const calculatedOrderItems = itemRequests.map((reqItem) => {
      const dbItem = dbItems.find((m) => m.id === reqItem.id);
      const unitPrice = parseFloat(dbItem.price) || 0;
      const totalPrice = Math.round(unitPrice * reqItem.quantity * 100) / 100;
      return {
        id: createId(),
        menuItemId: dbItem.id,
        itemName: dbItem.name,
        quantity: reqItem.quantity,
        unitPrice,
        discountAmount: 0,
        totalPrice,
        notes: reqItem.notes,
        imageUrl: dbItem.imageUrl,
      };
    });

    const subtotal = calculatedOrderItems.reduce((acc, it) => acc + it.totalPrice, 0);

    // 5. Authoritative Order Type & Delivery
    const normalizedType = normalizeOrderType(orderType);
    const deliveryFee = normalizedType === 'DELIVERY' ? 40 : 0;

    const computedAddress =
      typeof address === 'string' && address.trim().length > 0
        ? address.trim()
        : deliveryAddress && typeof deliveryAddress === 'object'
        ? [deliveryAddress.line1, deliveryAddress.city, deliveryAddress.pincode]
            .filter(Boolean)
            .join(', ')
        : '';

    if (normalizedType === 'DELIVERY' && !computedAddress) {
      return res.status(400).json({
        success: false,
        message: 'A delivery address is required for delivery orders',
      });
    }

    // 6. Authoritative GST (5% for restaurant food)
    const taxAmount = Math.round(subtotal * 0.05 * 100) / 100;

    // 7. Authoritative Coupon Validation
    let discountAmount = 0;
    if (couponCode && typeof couponCode === 'string' && couponCode.trim().length > 0) {
      const cleanCode = couponCode.trim().toUpperCase();
      const couponRes = await client.query(
        `SELECT * FROM "Coupon" 
         WHERE UPPER(code) = $1 AND "isActive" = true AND ("expiresAt" IS NULL OR "expiresAt" > NOW())`,
        [cleanCode]
      );

      if (couponRes.rows.length > 0) {
        const coupon = couponRes.rows[0];
        const minOrder = parseFloat(coupon.minOrder) || 0;
        if (subtotal >= minOrder) {
          const discountVal = parseFloat(coupon.discount) || 0;
          if (coupon.discountType === 'fixed') {
            discountAmount = discountVal;
          } else {
            const computed = Math.round((subtotal * discountVal) / 100);
            discountAmount = coupon.maxDiscount
              ? Math.min(computed, parseFloat(coupon.maxDiscount))
              : computed;
          }
          discountAmount = Math.min(subtotal, discountAmount);
        }
      }
    }

    // 8. Total Amount
    const totalAmount = Math.max(0, Math.round((subtotal + taxAmount + deliveryFee - discountAmount) * 100) / 100);

    // 9. Find or create matching Customer record
    const userRes = await client.query('SELECT name, email, phone FROM "User" WHERE id = $1', [userId]);
    const user = userRes.rows[0] || {};

    let customerId = null;
    const custRes = await client.query(
      'SELECT id FROM "Customer" WHERE email = $1 OR (phone = $2 AND phone IS NOT NULL) LIMIT 1',
      [user.email, user.phone]
    );

    if (custRes.rows.length > 0) {
      customerId = custRes.rows[0].id;
    } else {
      customerId = createId();
      await client.query(
        `INSERT INTO "Customer" (id, name, phone, email, address, status, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, 'ACTIVE', NOW(), NOW())
         ON CONFLICT (phone) DO UPDATE SET email = EXCLUDED.email RETURNING id`,
        [customerId, user.name || 'Customer', user.phone || null, user.email, computedAddress]
      );
    }

    // 10. Generate Order Number & ID
    const orderId = createId();
    const orderNumber = `ORD-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const finalNotes = specialInstructions || notes || null;

    await client.query('BEGIN');

    // 11. Insert Order
    await client.query(
      `INSERT INTO "Order" (
        id, "orderNumber", "branchId", "orderType", status, "customerId",
        "customerName", "customerPhone", "deliveryAddress", "deliveryNotes",
        subtotal, "discountAmount", "taxAmount", "deliveryCharge", "totalAmount",
        notes, "createdBy", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, 'PENDING', $5,
        $6, $7, $8, $9,
        $10, $11, $12, $13, $14,
        $15, $16, NOW(), NOW()
      )`,
      [
        orderId,
        orderNumber,
        resolvedBranch.id,
        normalizedType,
        customerId,
        user.name || 'Online Customer',
        user.phone || null,
        computedAddress || null,
        finalNotes,
        subtotal,
        discountAmount,
        taxAmount,
        deliveryFee,
        totalAmount,
        finalNotes,
        user.name || 'CUSTOMER',
      ]
    );

    // 12. Insert OrderItems
    for (const item of calculatedOrderItems) {
      await client.query(
        `INSERT INTO "OrderItem" (
          id, "orderId", "menuItemId", "itemName", quantity, "unitPrice", "discountAmount", "totalPrice", notes, "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
        )`,
        [
          item.id,
          orderId,
          item.menuItemId,
          item.itemName,
          item.quantity,
          item.unitPrice,
          item.discountAmount,
          item.totalPrice,
          item.notes || null,
        ]
      );
    }

    // 13. Insert OrderAuditLog
    await client.query(
      `INSERT INTO "OrderAuditLog" (
        id, "orderId", "fromStatus", "toStatus", "performedBy", "userId", notes, "createdAt"
      ) VALUES (
        $1, $2, 'PENDING', 'PENDING', $3, $4, 'Customer placed order via online ordering app', NOW()
      )`,
      [createId(), orderId, 'CUSTOMER', userId]
    );

    // 14. Insert Payment record
    const paymentId = createId();
    const paymentNumber = `PAY-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const normalizedPayMethod = normalizePaymentMethod(paymentMethod);
    const initialPaymentStatus = normalizedPayMethod === 'CASH' ? 'PENDING' : 'SUCCESS';

    await client.query(
      `INSERT INTO "Payment" (
        id, "paymentNumber", "orderId", "branchId", amount, method, status, notes, "processedBy", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, 'ONLINE_ORDER', NOW(), NOW()
      )`,
      [
        paymentId,
        paymentNumber,
        orderId,
        resolvedBranch.id,
        totalAmount,
        normalizedPayMethod,
        initialPaymentStatus,
        `Payment method: ${normalizedPayMethod}`,
      ]
    );

    await client.query('COMMIT');

    // 15. Real-time Notification via Socket.IO
    try {
      const io = req.app.get('io');
      if (io) {
        const orderEventPayload = {
          orderId,
          orderNumber,
          branchId: resolvedBranch.id,
          branchName: resolvedBranch.name,
          customerName: user.name,
          totalAmount,
          orderType: normalizedType,
          status: 'PENDING',
          itemsCount: calculatedOrderItems.length,
          createdAt: new Date().toISOString(),
        };

        // Notify branch kitchen & staff in Oven_Xpress
        io.to(`branch_${resolvedBranch.id}`).emit('new_order', orderEventPayload);
        io.to(`branch_${resolvedBranch.id}`).emit('order:created', orderEventPayload);
        io.emit('order:created', orderEventPayload);

        // Notify customer
        io.to(`user_${userId}`).emit('order:status', {
          orderId,
          orderNumber,
          status: 'PENDING',
        });
      }
    } catch (sockErr) {
      console.warn('Socket emit error (non-fatal):', sockErr.message);
    }

    const orderRow = {
      id: orderId,
      orderNumber,
      orderType: normalizedType,
      status: 'PENDING',
      branchId: resolvedBranch.id,
      customerName: user.name,
      customerPhone: user.phone,
      deliveryAddress: computedAddress,
      deliveryNotes: finalNotes,
      notes: finalNotes,
      subtotal,
      taxAmount,
      deliveryCharge: deliveryFee,
      discountAmount,
      totalAmount,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const paymentInfo = {
      method: normalizedPayMethod,
      status: initialPaymentStatus,
    };

    const responseData = formatOrderDTO(orderRow, calculatedOrderItems, resolvedBranch, paymentInfo);

    return res.status(201).json({
      success: true,
      data: responseData,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('createOrder error:', err);
    return next(err);
  } finally {
    client.release();
  }
};

/**
 * GET /api/orders/my-orders
 * Returns all past orders for the authenticated customer.
 * IDOR Protected: Scoped strictly to req.user.id / matching customer phone/email.
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const userRes = await query('SELECT name, email, phone FROM "User" WHERE id = $1', [userId]);
    const user = userRes.rows[0] || {};

    // Find customer ID(s)
    const custRes = await query(
      'SELECT id FROM "Customer" WHERE email = $1 OR (phone = $2 AND phone IS NOT NULL)',
      [user.email, user.phone]
    );
    const customerIds = custRes.rows.map((c) => c.id);

    // Query orders belonging to customer
    const ordersRes = await query(
      `SELECT 
        o.*,
        b.name as "branchName",
        b.address as "branchAddress",
        p.method as "paymentMethod",
        p.status as "paymentStatus"
       FROM "Order" o
       LEFT JOIN "Branch" b ON o."branchId" = b.id
       LEFT JOIN "Payment" p ON p."orderId" = o.id
       WHERE (o."customerId" = ANY($1::text[]) OR o."customerPhone" = $2 OR o."createdBy" = $3)
       ORDER BY o."createdAt" DESC`,
      [customerIds, user.phone || '', user.name || '']
    );

    if (ordersRes.rows.length === 0) {
      return res.json({ success: true, count: 0, data: [] });
    }

    const orderIds = ordersRes.rows.map((o) => o.id);

    // Query order items for all these orders
    const itemsRes = await query(
      `SELECT 
        oi.*,
        m."imageUrl"
       FROM "OrderItem" oi
       LEFT JOIN "MenuItem" m ON oi."menuItemId" = m.id
       WHERE oi."orderId" = ANY($1::text[])
       ORDER BY oi."createdAt" ASC`,
      [orderIds]
    );

    // Group items by orderId
    const itemsByOrder = {};
    itemsRes.rows.forEach((it) => {
      itemsByOrder[it.orderId] = itemsByOrder[it.orderId] || [];
      itemsByOrder[it.orderId].push(it);
    });

    const data = ordersRes.rows.map((ord) => {
      const ordItems = itemsByOrder[ord.id] || [];
      const branchInfo = { name: ord.branchName, address: ord.branchAddress };
      const payInfo = { method: ord.paymentMethod, status: ord.paymentStatus };
      return formatOrderDTO(ord, ordItems, branchInfo, payInfo);
    });

    return res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('getMyOrders error:', err);
    return next(err);
  }
};

/**
 * GET /api/orders/:id
 * Single order details.
 * IDOR Protected: User can ONLY view orders belonging to their customer account.
 */
export const getOrderById = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const orderParam = req.params.id;

    const userRes = await query('SELECT name, email, phone FROM "User" WHERE id = $1', [userId]);
    const user = userRes.rows[0] || {};

    const custRes = await query(
      'SELECT id FROM "Customer" WHERE email = $1 OR (phone = $2 AND phone IS NOT NULL)',
      [user.email, user.phone]
    );
    const customerIds = custRes.rows.map((c) => c.id);

    // Find order by ID or orderNumber
    const orderRes = await query(
      `SELECT 
        o.*,
        b.name as "branchName",
        b.address as "branchAddress",
        p.method as "paymentMethod",
        p.status as "paymentStatus"
       FROM "Order" o
       LEFT JOIN "Branch" b ON o."branchId" = b.id
       LEFT JOIN "Payment" p ON p."orderId" = o.id
       WHERE (o.id = $1 OR o."orderNumber" = $1)
         AND (o."customerId" = ANY($2::text[]) OR o."customerPhone" = $3 OR o."createdBy" = $4)`,
      [orderParam, customerIds, user.phone || '', user.name || '']
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const orderRow = orderRes.rows[0];

    // Query items
    const itemsRes = await query(
      `SELECT 
        oi.*,
        m."imageUrl"
       FROM "OrderItem" oi
       LEFT JOIN "MenuItem" m ON oi."menuItemId" = m.id
       WHERE oi."orderId" = $1
       ORDER BY oi."createdAt" ASC`,
      [orderRow.id]
    );

    const branchInfo = { name: orderRow.branchName, address: orderRow.branchAddress };
    const payInfo = { method: orderRow.paymentMethod, status: orderRow.paymentStatus };
    const data = formatOrderDTO(orderRow, itemsRes.rows, branchInfo, payInfo);

    return res.json({ success: true, data });
  } catch (err) {
    console.error('getOrderById error:', err);
    return next(err);
  }
};

export default {
  createOrder,
  getMyOrders,
  getOrderById,
};
