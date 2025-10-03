import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Offer {
  id: number;
  title: string;
  description: string;
  discount: string;
  code: string;
  bgColor: string;
}

interface OffersCarouselProps {
  onApplyOffer: (code: string) => void;
}

const OffersCarousel: React.FC<OffersCarouselProps> = ({ onApplyOffer }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const offers: Offer[] = [
    {
      id: 1,
      title: "First Order Special",
      description: "Get ₹50 off on your first order. Perfect for new customers!",
      discount: "₹50 OFF",
      code: "FIRST50",
      bgColor: "bg-gradient-to-r from-emerald-500 to-emerald-600"
    },
    {
      id: 2,
      title: "Weekend Discount",
      description: "Enjoy 10% off on all orders. Valid on weekends only.",
      discount: "10% OFF",
      code: "OVEN10",
      bgColor: "bg-gradient-to-r from-orange-500 to-red-500"
    },
    {
      id: 3,
      title: "Free Delivery",
      description: "Free delivery on orders above ₹500. No minimum order required.",
      discount: "FREE DELIVERY",
      code: "FREEDEL",
      bgColor: "bg-gradient-to-r from-blue-500 to-purple-600"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % offers.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [offers.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % offers.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + offers.length) % offers.length);
  };

  const handleApplyOffer = (code: string) => {
    onApplyOffer(code);
  };

  return (
    <div className="relative w-full mb-6">
      <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Tag className="h-5 w-5 text-warm-orange" />
        Active Offers
      </h3>
      
      <div className="relative overflow-hidden rounded-2xl">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {offers.map((offer) => (
            <div key={offer.id} className="w-full flex-shrink-0">
              <Card className="border-0 shadow-soft overflow-hidden">
                <CardContent className={`p-6 ${offer.bgColor} text-white relative`}>
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">
                      {offer.discount}
                    </span>
                  </div>
                  
                  <h4 className="text-2xl font-bold mb-2">{offer.title}</h4>
                  <p className="text-white/90 mb-4 leading-relaxed">{offer.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg">
                      <span className="text-sm font-mono font-bold">Code: {offer.code}</span>
                    </div>
                    <Button 
                      onClick={() => handleApplyOffer(offer.code)}
                      variant="secondary"
                      className="bg-white text-gray-900 hover:bg-white/90 font-semibold"
                    >
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-200"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-all duration-200"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {offers.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentSlide === index 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OffersCarousel;