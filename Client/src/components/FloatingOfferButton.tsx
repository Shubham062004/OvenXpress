import { useState, useEffect } from 'react';
import { Percent, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FloatingOfferButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isDismissed) {
        setIsVisible(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-gentle">
      <div className="relative bg-gradient-warm text-white p-4 rounded-2xl shadow-floating max-w-xs z-10">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 bg-white text-rich-brown rounded-full p-1 shadow-soft hover:scale-110 transition-transform duration-200"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-white/20 rounded-full">
            <Percent className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Today's Offer!</h3>
            <p className="text-sm opacity-90">Limited Time Only</p>
          </div>
        </div>

        <p className="text-sm mb-4 opacity-90">
          Get <span className="font-bold text-xl">25% OFF</span> on your first order above $30
        </p>

        <Button className="w-full bg-white text-rich-brown hover:bg-creamy-beige font-semibold shadow-soft">
          Claim Offer
        </Button>
      </div>
    </div>
  );
};

export default FloatingOfferButton;