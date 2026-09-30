// Client/src/components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, User, LogOut, MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useBranch } from '@/contexts/BranchContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import ovenExpressLogo from '@/assets/oven-express-logo.png';
import BranchSelectorModal from '@/components/BranchSelectorModal';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { selectedBranch, isBranchModalOpen, setIsBranchModalOpen } = useBranch();
  const navigate = useNavigate();
  const location = useLocation();

  const isLightHero = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Branches', href: '/branches' },
    { label: 'Menu', href: '/menu' },
    ...(isAuthenticated ? [{ label: 'My Orders', href: '/orders' }] : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const isTransparent = !isScrolled && isLightHero;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isTransparent
            ? 'bg-transparent py-4 text-white'
            : 'bg-background/95 backdrop-blur-md shadow-sm py-2.5 text-foreground border-b border-border'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center space-x-2.5">
                <img
                  src={ovenExpressLogo}
                  alt="Oven Xpress"
                  className={`transition-all duration-300 object-contain ${
                    isScrolled ? 'h-9 w-9' : 'h-11 w-11'
                  }`}
                />
                <span
                  className={`font-extrabold tracking-tight transition-all duration-300 ${
                    isScrolled ? 'text-xl' : 'text-2xl'
                  } ${isTransparent ? 'text-white' : 'text-foreground'}`}
                >
                  Oven <span className="text-warm-orange">Xpress</span>
                </span>
              </Link>

              {/* Quick Branch Location Selector Pill (Desktop) */}
              <button
                onClick={() => setIsBranchModalOpen(true)}
                className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  isTransparent
                    ? 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                    : 'bg-muted/80 hover:bg-muted text-foreground border-border'
                }`}
                title="Change ordering branch"
              >
                <MapPin className="w-3.5 h-3.5 text-warm-orange shrink-0" />
                <span className="max-w-[160px] truncate">
                  {selectedBranch ? selectedBranch.name : 'Select Branch'}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`transition-colors duration-200 text-sm font-medium hover:text-warm-orange ${
                    location.pathname === item.href
                      ? 'text-warm-orange font-semibold'
                      : isTransparent
                      ? 'text-white/90'
                      : 'text-foreground/90'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* Cart Icon Button */}
              <button
                className={`relative p-2 rounded-lg transition-colors ${
                  isTransparent ? 'hover:bg-white/10 text-white' : 'hover:bg-muted text-foreground'
                }`}
                onClick={() => navigate('/cart')}
                aria-label="View shopping cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-warm-orange text-white text-[11px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Auth Actions */}
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-2 text-xs font-semibold ${
                      isTransparent ? 'text-white hover:bg-white/10' : 'text-foreground hover:bg-muted'
                    }`}
                    onClick={() => navigate('/profile')}
                  >
                    <User className="h-4 w-4 text-warm-orange" />
                    <span>{user?.name?.split(' ')[0] || 'Profile'}</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-warm-orange hover:bg-warm-orange/90 text-white text-xs px-4"
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu & Cart */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => setIsBranchModalOpen(true)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${
                  isTransparent
                    ? 'bg-white/10 text-white border-white/20'
                    : 'bg-muted text-foreground border-border'
                }`}
              >
                <MapPin className="w-3 h-3 text-warm-orange" />
                <span className="max-w-[90px] truncate">
                  {selectedBranch ? selectedBranch.city : 'Branch'}
                </span>
              </button>

              <button
                className={`relative p-2 rounded-lg ${
                  isTransparent ? 'text-white' : 'text-foreground'
                }`}
                onClick={() => navigate('/cart')}
                aria-label="View shopping cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-warm-orange text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              <button
                className={`p-2 rounded-lg ${
                  isTransparent ? 'text-white' : 'text-foreground'
                }`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-3 pb-4 pt-2 border-t border-border/50 bg-background/95 rounded-b-xl px-2 text-foreground">
              <div className="flex flex-col space-y-3 pt-2">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="px-3 py-2 rounded-md hover:bg-muted font-medium text-sm text-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}

                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      className="px-3 py-2 rounded-md hover:bg-muted font-medium text-sm flex items-center gap-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4 text-warm-orange" />
                      <span>My Account ({user?.name || 'Customer'})</span>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs gap-2"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button
                    className="w-full bg-warm-orange hover:bg-warm-orange/90 text-white text-sm mt-2"
                    onClick={() => {
                      navigate('/login');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Global Branch Selector Modal */}
      <BranchSelectorModal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
      />
    </>
  );
};

export default Navbar;