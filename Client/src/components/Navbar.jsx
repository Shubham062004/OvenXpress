import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Menu, X, Heart } from "lucide-react";
import { useUser, SignInButton, UserButton } from "@clerk/clerk-react";
import logo from "../assets/logo.png";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSignedIn, user } = useUser();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    if (user && isSignedIn) {
      fetchWishlistCount();
      fetchCartItemCount();
    } else {
      setWishlistCount(0);
      setCartItemCount(0);
    }
  }, [user, isSignedIn]);

  const fetchWishlistCount = async () => {
    if (!user) return;
    try {
      const response = await fetch(`http://localhost:6003/api/wishlist/${user.id}`);
      const data = await response.json();
      setWishlistCount(data.length || 0);
    } catch (error) {
      console.error("Error fetching wishlist count:", error);
      setWishlistCount(0);
    }
  };
  
  const fetchCartItemCount = async () => {
    if (!user) return;
    try {
      const response = await fetch(`http://localhost:6003/api/cart/${user.id}`);
      const data = await response.json();
      const totalCount = data.reduce((sum, item) => sum + item.quantity, 0);
      setCartItemCount(totalCount || 0);
    } catch (error) {
      console.error("Error fetching cart count:", error);
      setCartItemCount(0);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold flex items-center">
            <img src={logo} alt="Oven Express Logo" className="h-8 mr-2" />
            OVEN EXPRESS
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="font-open-sans font-bold hover:text-orange-500">HOME</Link>
            <Link to="/menu" className="font-open-sans font-bold hover:text-orange-500">MENU</Link>
            <Link to="/about" className="font-open-sans font-bold hover:text-orange-500">ABOUT US</Link>
            <Link to="/contact" className="font-open-sans font-bold hover:text-orange-500">CONTACT US</Link>

            {isSignedIn && (
              <>
                <Link to="/wishlist" className="relative hover:text-orange-500">
                  <Heart className="w-6 h-6" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link to="/cart" className="relative hover:text-orange-500">
                  <ShoppingCart className="w-6 h-6" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <SignInButton mode="modal">
                <button className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors">
                  <p className="font-open-sans font-bold">Login</p>
                </button>
              </SignInButton>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="font-open-sans font-bold block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100">Home</Link>
            <Link to="/menu" className="font-open-sans font-bold block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100">Menu</Link>
            <Link to="/about" className="font-open-sans font-bold block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100">About Us</Link>
            <Link to="/contact" className="font-open-sans font-bold block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100">Contact Us</Link>

            {isSignedIn && (
              <>
                <Link to="/wishlist" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100">
                  Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                </Link>
                <Link to="/cart" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100">
                  Cart {cartItemCount > 0 && `(${cartItemCount})`}
                </Link>
              </>
            )}

            {isSignedIn ? (
              <div className="px-3 py-2">
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-orange-500 text-white hover:bg-orange-600">
                  Login
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;