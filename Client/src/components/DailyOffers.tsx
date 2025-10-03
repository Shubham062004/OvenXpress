import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import pastaCarbonara from '@/assets/pasta-carbonara.jpg';
import grilledSalmon from '@/assets/grilled-salmon.jpg';
import tiramisuDessert from '@/assets/tiramisu-dessert.jpg';

const DailyOffers = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const offers = [
    {
      id: 1,
      title: "Monday Special",
      dish: "Creamy Carbonara",
      originalPrice: "$24.99",
      offerPrice: "$18.99",
      image: pastaCarbonara,
      description: "Traditional Roman pasta with pancetta, eggs, and Parmesan",
      rating: 4.8,
      time: "15 min",
    },
    {
      id: 2,
      title: "Tuesday Delight",
      dish: "Grilled Salmon",
      originalPrice: "$32.99",
      offerPrice: "$24.99",
      image: grilledSalmon,
      description: "Fresh Atlantic salmon with seasonal vegetables",
      rating: 4.9,
      time: "20 min",
    },
    {
      id: 3,
      title: "Wednesday Sweet",
      dish: "Tiramisu Classic",
      originalPrice: "$12.99",
      offerPrice: "$8.99",
      image: tiramisuDessert,
      description: "Traditional Italian dessert with coffee and mascarpone",
      rating: 4.7,
      time: "5 min",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % offers.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [offers.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % offers.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + offers.length) % offers.length);
  };

  return (
    <section id="offers" className="py-16 bg-creamy-beige">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-rich-brown mb-4">
            Today's Special
          </h2>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Carousel Container */}
          <div className="relative overflow-hidden rounded-3xl shadow-warm">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {offers.map((offer, index) => (
                <div key={offer.id} className="w-full flex-shrink-0">
                  <Card className="border-0 bg-gradient-card">
                    <CardContent className="p-0">
                      <div className="grid md:grid-cols-2 gap-0 min-h-[400px]">
                        {/* Image Section */}
                        <div className="relative">
                          <img
                            src={offer.image}
                            alt={offer.dish}
                            className="w-full h-full object-cover rounded-l-3xl md:rounded-l-3xl md:rounded-r-none rounded-r-3xl md:rounded-br-none"
                          />
                          <div className="absolute top-4 left-4 bg-deep-red text-white px-3 py-1 rounded-full text-sm font-semibold">
                            {offer.title}
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-8 flex flex-col justify-center">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-warm-orange text-warm-orange" />
                              <span className="text-sm font-medium">{offer.rating}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm">{offer.time}</span>
                            </div>
                          </div>

                          <h3 className="text-2xl md:text-3xl font-bold text-rich-brown mb-3">
                            {offer.dish}
                          </h3>

                          <p className="text-muted-foreground mb-6 leading-relaxed">
                            {offer.description}
                          </p>

                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-bold text-deep-red">
                                {offer.offerPrice}
                              </span>
                              <span className="text-lg text-muted-foreground line-through">
                                {offer.originalPrice}
                              </span>
                            </div>
                            <div className="bg-warm-orange/20 text-warm-orange px-3 py-1 rounded-full text-sm font-semibold">
                              Save {((parseFloat(offer.originalPrice.slice(1)) - parseFloat(offer.offerPrice.slice(1))) / parseFloat(offer.originalPrice.slice(1)) * 100).toFixed(0)}%
                            </div>
                          </div>

                          <Button className="bg-gradient-warm hover:opacity-90 font-semibold">
                            Order Now
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-soft rounded-full p-3 transition-all duration-200 hover:scale-110"
          >
            <ChevronLeft className="h-6 w-6 text-rich-brown" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-soft rounded-full p-3 transition-all duration-200 hover:scale-110"
          >
            <ChevronRight className="h-6 w-6 text-rich-brown" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 mt-8">
            {offers.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  currentSlide === index
                    ? 'bg-warm-orange scale-125'
                    : 'bg-muted hover:bg-warm-orange/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DailyOffers;