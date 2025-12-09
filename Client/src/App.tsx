import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import OfflineBanner from "./components/OfflineBanner";
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Staff from "./pages/Staff";
import StaffProfile from "./pages/StaffProfile";
import Inventory from "./pages/Inventory";
import BranchManager from "./pages/BranchManager";
import Kitchen from "./pages/Kitchen";
import Founderr from "./pages/Founderr";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import FloatingOfferButton from "./components/FloatingOfferButton";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const Layout = () => {
  const location = useLocation();
  const showNavbarAndFloating = location.pathname === '/' || location.pathname === '/menu';
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {showNavbarAndFloating && <Navbar />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/staff" element={
          <ProtectedRoute roles={['staff', 'manager', 'founder']}>
            <Staff />
          </ProtectedRoute>
        } />
        <Route path="/staff/:id" element={
          <ProtectedRoute roles={['staff', 'manager', 'founder']}>
            <StaffProfile />
          </ProtectedRoute>
        } />
        <Route path="/inventory" element={
          <ProtectedRoute roles={['manager', 'founder']}>
            <Inventory />
          </ProtectedRoute>
        } />
        <Route path="/manager/branch/:id" element={
          <ProtectedRoute roles={['manager', 'founder']}>
            <BranchManager />
          </ProtectedRoute>
        } />
        <Route path="/kitchen" element={
          <ProtectedRoute allowedRoles={['staff', 'branch_manager', 'founder']}>
            <Kitchen />
          </ProtectedRoute>
        } />
        <Route path="/founderr" element={
          <ProtectedRoute roles={['founder']}>
            <Founderr />
          </ProtectedRoute>
        } />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showNavbarAndFloating && <FloatingOfferButton />}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
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
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
