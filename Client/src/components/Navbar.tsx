import { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import ovenExpressLogo from '@/assets/oven-express-logo.png';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Menu', href: '/menu' },
    { label: 'Offers', href: '#offers' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-sm shadow-soft py-2'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img
              src={ovenExpressLogo}
              alt="Oven Express"
              className={`transition-all duration-300 ${
                isScrolled ? 'h-10 w-10' : 'h-12 w-12'
              }`}
            />
            <span
              className={`font-bold transition-all duration-300 ${
                isScrolled ? 'text-xl text-black' : 'text-2xl text-white'
              }`}
            >
              Oven Express
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`hover:text-warm-orange transition-colors duration-200 font-medium ${
                  isScrolled ? 'text-black' : 'text-white'
                }`}
              >
                {item.label}
              </a>
            ))}
            {totalItems === 0 ? (
              <Button 
                variant="default" 
                className="bg-gradient-warm hover:opacity-90"
                onClick={() => navigate('/menu')}
              >
                Order Now
              </Button>
            ) : (
              <button 
                className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCart className={`h-6 w-6 ${isScrolled ? 'text-black' : 'text-white'}`} />
                <span className="absolute -top-1 -right-1 bg-warm-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  {totalItems}
                </span>
              </button>
            )}
            <Button 
              variant="default" 
              className="bg-gradient-warm hover:opacity-90"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border">
            <div className="flex flex-col space-y-4 pt-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`hover:text-warm-orange transition-colors duration-200 font-medium ${
                    isScrolled ? 'text-black' : 'text-white'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
               {totalItems === 0 ? (
                <Button 
                  variant="default" 
                  className="bg-gradient-warm hover:opacity-90 w-fit"
                  onClick={() => navigate('/menu')}
                >
                  Order Now
                </Button>
              ) : (
                <button 
                  className="relative p-2 w-fit hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => navigate('/cart')}
                >
                  <ShoppingCart className={`h-6 w-6 ${isScrolled ? 'text-black' : 'text-white'}`} />
                  <span className="absolute -top-1 -right-1 bg-warm-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {totalItems}
                  </span>
                </button>
              )}
              <Button 
                variant="default" 
                className="bg-gradient-warm hover:opacity-90 w-fit"
                onClick={() => {
                  navigate('/login');
                  setIsMobileMenuOpen(false);
                }}
              >
                Login
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;