import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import heroSpecial from '@/assets/hero-special.jpg';
import pastaCarbonara from '@/assets/pasta-carbonara.jpg';
import grilledSalmon from '@/assets/grilled-salmon.jpg';
import tiramisuDessert from '@/assets/tiramisu-dessert.jpg';

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { addItem } = useCart();
  const navigate = useNavigate();

  const specials = [
    {
      id: 1,
      name: 'Authentic Italian Margherita Pizza',
      description: 'Hand-stretched dough, San Marzano tomatoes, fresh mozzarella, and aromatic basil. Baked to perfection in our traditional wood-fired oven.',
      price: 299,
      priceDisplay: '₹299',
      image: heroSpecial,
      category: 'Pizza',
      tag: "TODAY'S SPECIAL"
    },
    {
      id: 2,
      name: 'Creamy Pasta Carbonara',
      description: 'Classic Italian pasta with pancetta, eggs, and parmesan cheese. Rich, creamy, and absolutely delicious.',
      price: 399,
      priceDisplay: '₹399',
      image: pastaCarbonara,
      category: 'Pasta',
      tag: "CHEF'S CHOICE"
    },
    {
      id: 3,
      name: 'Grilled Atlantic Salmon',
      description: 'Fresh Atlantic salmon grilled to perfection with herbs and lemon. Served with seasonal vegetables.',
      price: 599,
      priceDisplay: '₹599',
      image: grilledSalmon,
      category: 'Seafood',
      tag: "PREMIUM PICK"
    },
    {
      id: 4,
      name: 'Classic Tiramisu',
      description: 'Traditional Italian dessert with coffee-soaked ladyfingers and mascarpone. The perfect ending to your meal.',
      price: 199,
      priceDisplay: '₹199',
      image: tiramisuDessert,
      category: 'Dessert',
      tag: "SWEET FINISH"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % specials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % specials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + specials.length) % specials.length);
  };

  const currentSpecial = specials[currentSlide];

  const handleOrderSpecial = () => {
    addItem({
      id: currentSpecial.id,
      name: currentSpecial.name,
      price: currentSpecial.price,
      image: currentSpecial.image,
      category: currentSpecial.category
    });
    navigate('/cart');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={currentSpecial.image}
          alt={currentSpecial.name}
          className="w-full h-full object-cover transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-hero"></div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-200"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-200"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="animate-fade-in-up">
          <span className="inline-block bg-warm-orange/20 text-warm-orange px-4 py-2 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm">
            {currentSpecial.tag}
          </span>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {currentSpecial.name.split(' ').slice(0, -1).join(' ')}
            <span className="block text-warm-orange">{currentSpecial.name.split(' ').slice(-1)}</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            {currentSpecial.description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-gradient-warm hover:opacity-90 text-white font-semibold px-8 py-4 text-lg shadow-floating animate-bounce-gentle"
              onClick={handleOrderSpecial}
            >
              Order Special - {currentSpecial.priceDisplay}
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-rich-brown font-semibold px-8 py-4 text-lg backdrop-blur-sm"
              style={{ backgroundColor: 'hsl(var(--warm-orange))' }}
              onClick={() => navigate('/menu')}
            >
              View Full Menu
            </Button>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
        {specials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === index 
                ? 'bg-warm-orange scale-125' 
                : 'bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;