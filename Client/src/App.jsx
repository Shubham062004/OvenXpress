import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from '@clerk/clerk-react';
import HomePage from "./components/Home";
import MenuPage from "./components/MenuPage";
import CheckoutPage from "./components/CheckoutPage";
import OrderStatusPage from "./components/OrderStatusPage";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import { CartProvider } from "./contexts/CartContext";  
import WishlistPage from "./components/WishlistPage";
import CartPage from "./components/CartPage";
import "./index.css";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <CartProvider>  {/* Wrapping the app with CartProvider */}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-status" element={<OrderStatusPage />} />
            <Route path="/admin-dash" element={<AdminDashboard />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </ClerkProvider>
  );
}

export default App;
