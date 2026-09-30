import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    branch: {
      type: mongoose.Schema.Types.Mixed,
      default: 1,
    },
    items: {
      type: [orderItemSchema],
      required: true,
    },
    orderType: {
      type: String,
      enum: ['DINE_IN', 'TAKEAWAY', 'DELIVERY', 'dine-in', 'takeaway', 'delivery'],
      default: 'DELIVERY',
    },
    status: {
      type: String,
      enum: [
        'ORDER_PLACED',
        'CONFIRMED',
        'PREPARING',
        'READY',
        'OUT_FOR_DELIVERY',
        'COMPLETED',
        'CANCELLED',
      ],
      default: 'ORDER_PLACED',
      index: true,
    },
    subtotal: { type: Number, required: true },
    gst: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponCode: { type: String, default: null },
    address: { type: String, default: '' },
    deliveryAddress: { type: mongoose.Schema.Types.Mixed, default: null },
    specialInstructions: { type: String, default: '' },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'UPI', 'CARD', 'ONLINE', 'cash', 'online'],
      default: 'CASH',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
