import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import OfflineBanner from "./components/OfflineBanner";
import Index from "./pages/Index";
import Branches from "./pages/Branches";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import FloatingOfferButton from "./components/FloatingOfferButton";
import { BranchProvider } from "./contexts/BranchContext";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const Layout = () => {
  const location = useLocation();
  const hideNavbarOn = ['/login', '/signup', '/forgot-password', '/reset-password'];
  const showNavbar = !hideNavbarOn.includes(location.pathname);
  const showFloatingOffer = location.pathname === '/' || location.pathname === '/menu' || location.pathname === '/branches';

  return (
    <div className="min-h-screen bg-background">
      {showNavbar && <Navbar />}
      <Routes>
        {/* Public Customer Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/branches" element={<Branches />} />
        <Route path="/locations" element={<Navigate to="/branches" replace />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Authenticated Customer Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:orderId"
          element={
            <ProtectedRoute>
              <OrderDetails />
            </ProtectedRoute>
          }
        />

        {/* Catch-All 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showFloatingOffer && <FloatingOfferButton />}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BranchProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ErrorBoundary>
                <OfflineBanner />
                <Layout />
              </ErrorBoundary>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </BranchProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
