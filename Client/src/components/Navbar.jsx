// import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

export function Navbar() {
  // Handle smooth scrolling for anchor links
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            Oven Express
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="font-medium">
              Home
            </Link>
            <button 
              onClick={() => scrollToSection('packages')} 
              className="font-medium"
            >
              Packages
            </button>
            <button 
              onClick={() => scrollToSection('about')} 
              className="font-medium"
            >
              About us
            </button>
            <button 
              onClick={() => scrollToSection('contact')} 
              className="font-medium"
            >
              Contact us
            </button>
            <Link to="/cart" className="relative">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                0
              </span>
            </Link>
            <button
              onClick={() => scrollToSection('book')}
              className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;