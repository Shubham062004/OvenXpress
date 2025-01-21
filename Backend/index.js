import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import MenuItem from "./models/MenuItem.js";
import Review from "./models/Review.js";

dotenv.config();

const app = express();

app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// API routes
app.get("/api/menu-items", async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching menu items" });
  }
});

app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await Review.find().populate("userId", "name").populate("menuItemId", "name");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews" });
  }
});

const PORT = process.env.PORT || 6001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
