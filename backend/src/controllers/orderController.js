// backend/src/controllers/orderController.js
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';

/**
 * Create a new order.
 * Expects body:
 * {
 *   items: [{ id: string (menuItemId), quantity: number, notes?: string }],
 *   subtotal: number,
 *   gst: number,
 *   total: number,
 *   discount?: number,
 *   couponCode?: string,
 *   address?: object or id,
 *   paymentMethod?: string
 * }
 */
export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    const {
      items,
      subtotal,
      gst,
      total,
      discount = 0,
      couponCode = null,
      address = null,
      paymentMethod = 'cash',
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item',
      });
    }

    // Validate menu item ids and fetch db items
    const menuIds = items.map((i) => i.id);
    const dbItems = await MenuItem.find({ _id: { $in: menuIds } }).lean();

    if (dbItems.length !== menuIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more menu items are invalid',
      });
    }

    // Build order items array matching Order schema
    const orderItems = items.map((i) => {
      const dbItem = dbItems.find((m) => m._id.toString() === i.id);
      return {
        menuItem: dbItem._id,
        name: dbItem.name,
        price: dbItem.price,
        quantity: i.quantity,
        notes: i.notes || '',
      };
    });

    const orderPayload = {
      customer: userId,            // matches your Order model which uses `customer`
      items: orderItems,
      subtotal,
      gst,
      total,
      discount,
      couponCode,
      address,                    // frontend may send address object or id; keep as-is for now
      paymentMethod,
      status: 'pending',          // default status (lowercase - matches your schema enum)
    };

    const order = await Order.create(orderPayload);

    return res.status(201).json({
      success: true,
      data: order,
    });
  } catch (err) {
    console.error('createOrder error', err);
    return next(err);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const orders = await Order.find({ customer: userId })
      .populate('items.menuItem')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (err) {
    console.error('getMyOrders error', err);
    return next(err);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const orderId = req.params.id;

    const order = await Order.findOne({ _id: orderId, customer: userId })
      .populate('items.menuItem')
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (err) {
    console.error('getOrderById error', err);
    return next(err);
  }
};
