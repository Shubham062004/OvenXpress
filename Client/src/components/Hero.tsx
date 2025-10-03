import { Button } from '@/components/ui/button';
import heroSpecial from '@/assets/hero-special.jpg';

const Hero = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroSpecial}
          alt="Today's Special"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="animate-fade-in-up">
          <span className="inline-block bg-warm-orange/20 text-warm-orange px-4 py-2 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm">
            TODAY'S SPECIAL
          </span>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Authentic Italian
            <span className="block text-warm-orange">Margherita Pizza</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Hand-stretched dough, San Marzano tomatoes, fresh mozzarella, and aromatic basil. 
            Baked to perfection in our traditional wood-fired oven.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-gradient-warm hover:opacity-90 text-white font-semibold px-8 py-4 text-lg shadow-floating animate-bounce-gentle"
            >
              Order Special - ₹299
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-rich-brown font-semibold px-8 py-4 text-lg backdrop-blur-sm"
              style={{ backgroundColor: 'hsl(var(--warm-orange))' }}
            >
              <a href="/menu">View Full Menu</a>
            </Button>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Hero;