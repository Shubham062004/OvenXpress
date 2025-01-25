import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
    required: true
  },
  text: {  // Changed from 'comment' to match your frontend
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes after schema definition
reviewSchema.index({ userId: 1 });       // For queries filtering by user
reviewSchema.index({ menuItemId: 1 });   // For queries filtering by menu item


const Review = mongoose.model("Review", reviewSchema);
export default Review;