import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    required: true,
    unique: true  // This automatically creates the unique index
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem"
  }],
  cart: [{
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem"
    },
    quantity: {
      type: Number,
      default: 1
    }
  }],
  name: String,
  email: String,
  phone: String,
  isAdmin: {
    type: Boolean,
    default: false
  }
});

// Remove the duplicate index definition below
const User = mongoose.model("User", userSchema);
export default User;