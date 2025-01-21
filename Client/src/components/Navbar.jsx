// import { useState, useEffect } from "react"
// import { Link } from "react-router-dom"
// import { ShoppingCart, Menu, X } from "lucide-react"
// import { useUser, SignInButton, UserButton } from "@clerk/clerk-react"
// import logo from "../assets/logo.png"

// export function Navbar() {
//   const [isMenuOpen, setIsMenuOpen] = useState(false)
//   const { isSignedIn, user } = useUser()
//   const [cartItemCount, setCartItemCount] = useState(0)

//   useEffect(() => {
//     const updateCartCount = () => {
//       const cart = JSON.parse(localStorage.getItem("cart") || "{}")
//       const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0)
//       setCartItemCount(count)
//     }

//     updateCartCount()
//     window.addEventListener("storage", updateCartCount)

//     return () => {
//       window.removeEventListener("storage", updateCartCount)
//     }
//   }, [])

//   const toggleMenu = () => {
//     setIsMenuOpen(!isMenuOpen)
//   }

//   return (
//     <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
//       <div className="container mx-auto px-4 py-4">
//         <div className="flex items-center justify-between">
//           <Link to="/" className="text-2xl font-bold flex">
//             <img src={logo} alt="Oven Express Logo" className="h-8" />
//             OVEN EXPRESS
//           </Link>

//           <div className="hidden md:flex items-center space-x-8">
//             <Link to="/" className="font-medium">
//               Home
//             </Link>
//             <Link to="/menu" className="font-medium">
//               Menu
//             </Link>
//             <Link to="/about" className="font-medium">
//               About Us
//             </Link>
//             <Link to="/contact" className="font-medium">
//               Contact Us
//             </Link>
//             <Link to="/cart" className="relative">
//               <ShoppingCart className="w-6 h-6" />
//               {cartItemCount > 0 && (
//                 <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
//                   {cartItemCount}
//                 </span>
//               )}
//             </Link>
//             {isSignedIn ? (
//               <div className="flex items-center space-x-4">
//                 <span className="font-medium">{user.firstName}</span>
//                 <UserButton afterSignOutUrl="/" />
//               </div>
//             ) : (
//               <SignInButton mode="modal">
//                 <button className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors">
//                   Login
//                 </button>
//               </SignInButton>
//             )}
//           </div>

//           <button className="md:hidden" onClick={toggleMenu}>
//             {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//           </button>
//         </div>
//       </div>

//       {/* Mobile menu */}
//       {isMenuOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300">
//           <div className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out">
//             <div className="p-4">
//               <img src="/assets/logo.png" alt="Oven Express Logo" className="h-8 mb-8" />
//               <div className="flex flex-col space-y-4">
//                 <Link to="/" className="font-medium" onClick={toggleMenu}>
//                   Home
//                 </Link>
//                 <Link to="/menu" className="font-medium" onClick={toggleMenu}>
//                   Menu
//                 </Link>
//                 <Link to="/about" className="font-medium" onClick={toggleMenu}>
//                   About Us
//                 </Link>
//                 <Link to="/contact" className="font-medium" onClick={toggleMenu}>
//                   Contact Us
//                 </Link>
//                 <Link to="/cart" className="font-medium" onClick={toggleMenu}>
//                   Cart
//                 </Link>
//                 <div className="border-t border-gray-200 my-4"></div>
//                 {isSignedIn ? (
//                   <>
//                     <span className="font-medium">{user.firstName}</span>
//                     <UserButton afterSignOutUrl="/" />
//                   </>
//                 ) : (
//                   <SignInButton mode="modal">
//                     <button className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors">
//                       Login
//                     </button>
//                   </SignInButton>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </nav>
//   )
// }

// export default Navbar

// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { ShoppingCart, Menu, X, Heart } from 'lucide-react';
// import { useUser, SignInButton, UserButton } from '@clerk/clerk-react';

// export function Navbar() {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const { isSignedIn, user } = useUser();
//   const [cartItemCount, setCartItemCount] = useState(0);
//   const [wishlistCount, setWishlistCount] = useState(0);

//   useEffect(() => {
//     const updateCartCount = () => {
//       const cart = JSON.parse(localStorage.getItem('cart') || '{}');
//       const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
//       setCartItemCount(count);
//     };

//     const updateWishlistCount = () => {
//       const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
//       setWishlistCount(wishlist.length);
//     };

//     updateCartCount();
//     updateWishlistCount();
//     window.addEventListener('storage', updateCartCount);
//     window.addEventListener('storage', updateWishlistCount);

//     return () => {
//       window.removeEventListener('storage', updateCartCount);
//       window.removeEventListener('storage', updateWishlistCount);
//     };
//   }, []);

//   const toggleMenu = () => {
//     setIsMenuOpen(!isMenuOpen);
//   };

//   return (
//     <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
//       <div className="container mx-auto px-4 py-4">
//         <div className="flex items-center justify-between">
//           <Link to="/" className="text-2xl font-bold">
//             <img src="/assets/logo.png" alt="Oven Express Logo" className="h-8" />
//           </Link>
          
//           <div className="hidden md:flex items-center space-x-8">
//             <Link to="/" className="font-medium">Home</Link>
//             <Link to="/menu" className="font-medium">Menu</Link>
//             <Link to="/about" className="font-medium">About Us</Link>
//             <Link to="/contact" className="font-medium">Contact Us</Link>
//             <Link to="/wishlist" className="relative">
//               <Heart className="w-6 h-6" />
//               {wishlistCount > 0 && (
//                 <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
//                   {wishlistCount}
//                 </span>
//               )}
//             </Link>
//             <Link to="/cart" className="relative">
//               <ShoppingCart className="w-6 h-6" />
//               {cartItemCount > 0 && (
//                 <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
//                   {cartItemCount}
//                 </span>
//               )}
//             </Link>
//             {isSignedIn ? (
//               <div className="flex items-center space-x-4">
//                 <Link to="/dashboard" className="font-medium">Dashboard</Link>
//                 <UserButton afterSignOutUrl="/" />
//               </div>
//             ) : (
//               <SignInButton mode="modal">
//                 <button className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors">
//                   Login
//                 </button>
//               </SignInButton>
//             )}
//           </div>

//           <button className="md:hidden" onClick={toggleMenu}>
//             {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//           </button>
//         </div>
//       </div>

//       {/* Mobile menu */}
//       {isMenuOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300">
//           <div className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out">
//             <div className="p-4">
//               <img src="/assets/logo.png" alt="Oven Express Logo" className="h-8 mb-8" />
//               <div className="flex flex-col space-y-4">
//                 <Link to="/" className="font-medium" onClick={toggleMenu}>Home</Link>
//                 <Link to="/menu" className="font-medium" onClick={toggleMenu}>Menu</Link>
//                 <Link to="/about" className="font-medium" onClick={toggleMenu}>About Us</Link>
//                 <Link to="/contact" className="font-medium" onClick={toggleMenu}>Contact Us</Link>
//                 <Link to="/wishlist" className="font-medium" onClick={toggleMenu}>Wishlist</Link>
//                 <Link to="/cart" className="font-medium" onClick={toggleMenu}>Cart</Link>
//                 {isSignedIn ? (
//                   <>
//                     <Link to="/dashboard" className="font-medium" onClick={toggleMenu}>Dashboard</Link>
//                     <UserButton afterSignOutUrl="/" />
//                   </>
//                 ) : (
//                   <SignInButton mode="modal">
//                     <button className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors">
//                       Login
//                     </button>
//                   </SignInButton>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// }

// export default Navbar;


import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Menu, X, Heart } from "lucide-react";
import { useUser, SignInButton, UserButton } from "@clerk/clerk-react";
import logo from "../assets/logo.png";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSignedIn, user } = useUser();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Update cart and wishlist counts
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "{}");
      const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
      setCartItemCount(count);
    };

    const updateWishlistCount = () => {
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setWishlistCount(wishlist.length);
    };

    updateCartCount();
    updateWishlistCount();

    // Add event listeners for storage updates
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("storage", updateWishlistCount);

    return () => {
      // Clean up event listeners
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("storage", updateWishlistCount);
    };
  }, []);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold flex items-center">
            <img src={logo} alt="Oven Express Logo" className="h-8 mr-2" />
            OVEN EXPRESS
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="font-medium">Home</Link>
            <Link to="/menu" className="font-medium">Menu</Link>
            <Link to="/about" className="font-medium">About Us</Link>
            <Link to="/contact" className="font-medium">Contact Us</Link>
            {/* Wishlist */}
            <Link to="/wishlist" className="relative">
              <Heart className="w-6 h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>
            {/* Cart */}
            <Link to="/cart" className="relative">
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cartItemCount}
                </span>
              )}
            </Link>
            {/* User Authentication */}
            {isSignedIn ? (
              <div className="flex items-center space-x-4">
                <span className="font-medium">{user?.firstName}</span>
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors">
                  Login
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300">
          <div className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out">
            <div className="p-4">
              {/* Mobile Logo */}
              <img src="/assets/logo.png" alt="Oven Express Logo" className="h-8 mb-8" />
              {/* Mobile Links */}
              <div className="flex flex-col space-y-4">
                <Link to="/" className="font-medium" onClick={toggleMenu}>Home</Link>
                <Link to="/menu" className="font-medium" onClick={toggleMenu}>Menu</Link>
                <Link to="/about" className="font-medium" onClick={toggleMenu}>About Us</Link>
                <Link to="/contact" className="font-medium" onClick={toggleMenu}>Contact Us</Link>
                <Link to="/wishlist" className="font-medium" onClick={toggleMenu}>Wishlist</Link>
                <Link to="/cart" className="font-medium" onClick={toggleMenu}>Cart</Link>
                {isSignedIn ? (
                  <>
                    <UserButton afterSignOutUrl="/" />
                    <span className="font-medium">{user?.firstName}</span>
                  </>
                ) : (
                  <SignInButton mode="modal">
                    <button
                      onClick={toggleMenu}
                      className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors"
                    >
                      Login
                    </button>
                  </SignInButton>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}


export default Navbar;