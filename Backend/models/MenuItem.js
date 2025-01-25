import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    enum: ["KRUSHER", "MOJITO", "BAKED PASTA", "SUB", "TEA", "COFFEE", "SUNDAE", "GARLIC BREAD", "FRIES", "RICE BOWL", "SANDWICH", "BURGER", "WRAP", "TACOS", "BURRITOS", "NOODLES", "FRIED RICE", "CHINESE VEG", "BIRYANI", "PIZZA", "MOMOS", "KATHI ROLL", "CHAAP", "CHINESE COMBOS", "INDIAN COMBO MEALS", "SALAD / PAPAD", "BREADS", "MAIN COURSE"],
  },
  imageUrl: {
    type: String,
    default: "/placeholder.svg",
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
});

// Correct export statement
export default mongoose.model("MenuItem", menuItemSchema);