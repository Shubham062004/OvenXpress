import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const {
    items,
    deliveryAddress,
    paymentDetails,
    specialInstructions,
    couponApplied
  } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'No order items provided' });
  }

  // Calculate total amount
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const menuItem = await MenuItem.findById(item.id);
    if (!menuItem || !menuItem.isAvailable) {
      return res.status(400).json({ 
        message: `Menu item ${item.name} is not available` 
      });
    }

    const orderItem = {
      menuItem: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: item.quantity,
      specialInstructions: item.specialInstructions || ''
    };

    orderItems.push(orderItem);
    totalAmount += menuItem.price * item.quantity;
  }

  // Apply coupon discount if provided
  if (couponApplied && couponApplied.discount) {
    totalAmount = Math.max(0, totalAmount - couponApplied.discount);
  }

  const order = await Order.create({
    customer: req.user.id,
    items: orderItems,
    totalAmount,
    deliveryAddress,
    paymentDetails,
    specialInstructions,
    couponApplied,
    estimatedDeliveryTime: new Date(Date.now() + 45 * 60000) // 45 minutes from now
  });

  const populatedOrder = await Order.findById(order._id)
    .populate('customer', 'name email phone')
    .populate('items.menuItem', 'name category');

  // Emit real-time update to kitchen
  req.app.get('io').to('kitchen').emit('new_order', populatedOrder);

  res.status(201).json(populatedOrder);
});

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
export const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user.id })
    .populate('items.menuItem', 'name image category')
    .sort({ createdAt: -1 });

  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'name email phone')
    .populate('items.menuItem', 'name image category price');

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  // Check if user owns the order or is admin
  if (order.customer._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  res.json(order);
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin/Kitchen only)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  order.status = status;
  
  if (status === 'delivered') {
    order.actualDeliveryTime = new Date();
  }

  await order.save();

  const updatedOrder = await Order.findById(order._id)
    .populate('customer', 'name email phone')
    .populate('items.menuItem', 'name category');

  // Emit real-time update
  req.app.get('io').emit('order_status_update', {
    orderId: order._id,
    status: status,
    customer: order.customer._id
  });

  res.json(updatedOrder);
});
