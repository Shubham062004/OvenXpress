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
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    gst: { type: Number, required: true },
    total: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    address: { type: String, required: true },
    paymentMethod: { type: String, enum: ['cash', 'online'], default: 'cash' },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
