import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import MenuItem from "./models/MenuItem.js";
import Review from "./models/Review.js";
import User from "./models/User.js";

dotenv.config();

const app = express();

const isAdmin = async (req, res, next) => {
  const { email, phone } = req.body;
  try {
    const user = await User.findOne({ email, phone, isAdmin: true });
    if (user) {
      next(); // Allow the request to proceed
    } else {
      res.status(403).json({ message: "Unauthorized: Admin access required" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error checking admin status" });
  }
};

app.use(express.json());

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173", // Local frontend
  "https://oven-express.vercel.app", // Production frontend
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error("Not allowed by CORS")); // Block the request
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    // Add a route to check MongoDB connection status
    app.get("/", (req, res) => {
      const mongoConnection = mongoose.connection.readyState === 1; // 1 means connected
      res.json({ message: mongoConnection ? "connected" : "disconnected" });
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);

    // Add a route to check MongoDB connection status (in case of error)
    app.get("/", (req, res) => {
      res.json({ message: "disconnected" });
    });
  });
// Menu Items Routes
app.get("/api/menu-items", async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching menu items" });
  }
});

app.post("/api/menu-items", isAdmin, async (req, res) => {
  try {
    const newMenuItem = new MenuItem(req.body);
    const savedMenuItem = await newMenuItem.save();
    res.status(201).json(savedMenuItem);
  } catch (error) {
    res.status(400).json({ message: "Error adding menu item", error: error.message });
  }
});

app.put("/api/menu-items/:id", isAdmin, async (req, res) => {
  try {
    const updatedMenuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedMenuItem) return res.status(404).json({ message: "Menu item not found" });
    res.json(updatedMenuItem);
  } catch (error) {
    res.status(400).json({ message: "Error updating menu item", error: error.message });
  }
});

app.delete("/api/menu-items/:id", isAdmin, async (req, res) => {
  try {
    const deletedMenuItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!deletedMenuItem) return res.status(404).json({ message: "Menu item not found" });
    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting menu item", error: error.message });
  }
});

// Reviews Routes
app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await Review.find().populate("userId", "name").populate("menuItemId", "name");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews" });
  }
});

app.post("/api/reviews", async (req, res) => {
  try {
    const newReview = new Review(req.body);
    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (error) {
    res.status(400).json({ message: "Error adding review", error: error.message });
  }
});

app.put("/api/reviews/:id", isAdmin, async (req, res) => {
  try {
    const updatedReview = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedReview) return res.status(404).json({ message: "Review not found" });
    res.json(updatedReview);
  } catch (error) {
    res.status(400).json({ message: "Error updating review", error: error.message });
  }
});

app.delete("/api/reviews/:id", isAdmin, async (req, res) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.id);
    if (!deletedReview) return res.status(404).json({ message: "Review not found" });
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting review", error: error.message });
  }
});

// Wishlist Routes
app.post("/api/wishlist", async (req, res) => {
  const { userId, menuItemId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    if (!user.wishlist.includes(menuItemId)) {
      user.wishlist.push(menuItemId);
      await user.save();
    }
    res.status(200).json({ message: "Item added to wishlist" });
  } catch (error) {
    res.status(500).json({ message: "Error adding item to wishlist", error: error.message });
  }
});

app.delete("/api/wishlist", async (req, res) => {
  const { userId, menuItemId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    user.wishlist = user.wishlist.filter((item) => item.toString() !== menuItemId);
    await user.save();
    res.status(200).json({ message: "Item removed from wishlist" });
  } catch (error) {
    res.status(500).json({ message: "Error removing item from wishlist", error: error.message });
  }
});

app.get("/api/wishlist/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("wishlist");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: "Error fetching wishlist", error: error.message });
  }
});

// Cart Routes
app.get("/api/cart/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("cart.menuItemId");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart", error: error.message });
  }
});

app.post("/api/cart", async (req, res) => {
  const { userId, menuItemId, quantity } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const existingItem = user.cart.find(item => item.menuItemId.toString() === menuItemId);
    
    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      user.cart.push({
        menuItemId,
        quantity: quantity || 1
      });
    }

    await user.save();
    res.status(200).json({ message: "Cart updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating cart", error: error.message });
  }
});

app.delete("/api/cart", async (req, res) => {
  const { userId, menuItemId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.cart = user.cart.filter(item => item.menuItemId.toString() !== menuItemId);
    await user.save();
    res.status(200).json({ message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ message: "Error removing item from cart", error: error.message });
  }
});

const PORT = process.env.PORT || 6003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});