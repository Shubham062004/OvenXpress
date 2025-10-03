import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus } from 'lucide-react';
import grilledSalmon from '@/assets/grilled-salmon.jpg';
import pastaCarbonara from '@/assets/pasta-carbonara.jpg';
import tiramisuDessert from '@/assets/tiramisu-dessert.jpg';
import heroSpecial from '@/assets/hero-special.jpg';

const Menu = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const { addItem, items, updateQuantity, removeItem } = useCart();
  const { toast } = useToast();

  const menuItems = [
    {
      id: 1,
      name: 'Margherita Pizza',
      originalPrice: 399,
      price: 299,
      originalPriceDisplay: '₹399',
      priceDisplay: '₹299',
      discount: 25,
      prepTime: '15-20 mins',
      serving: '2 people',
      spiceLevel: '',
      calories: 850,
      protein: 32,
      isHighProtein: false,
      image: heroSpecial,
      category: 'Pizza'
    },
    {
      id: 2,
      name: 'Grilled Salmon',
      originalPrice: 799,
      price: 599,
      originalPriceDisplay: '₹799',
      priceDisplay: '₹599',
      discount: 25,
      prepTime: '25-30 mins',
      serving: '1 person',
      spiceLevel: '🌶️',
      calories: 420,
      protein: 38,
      isHighProtein: true,
      image: grilledSalmon,
      category: 'Seafood'
    },
    {
      id: 3,
      name: 'Pasta Carbonara',
      originalPrice: 499,
      price: 399,
      originalPriceDisplay: '₹499',
      priceDisplay: '₹399',
      discount: 20,
      prepTime: '20-25 mins',
      serving: '1 person',
      spiceLevel: '',
      calories: 650,
      protein: 22,
      isHighProtein: false,
      image: pastaCarbonara,
      category: 'Pasta'
    },
    {
      id: 4,
      name: 'Tiramisu',
      originalPrice: 249,
      price: 199,
      originalPriceDisplay: '₹249',
      priceDisplay: '₹199',
      discount: 20,
      prepTime: '5-10 mins',
      serving: '1 person',
      spiceLevel: '',
      calories: 390,
      protein: 8,
      isHighProtein: false,
      image: tiramisuDessert,
      category: 'Dessert'
    }
  ];

  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const getItemQuantity = (itemId: number) => {
    const cartItem = items.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = (item: typeof menuItems[0]) => {
    const quantity = getItemQuantity(item.id);
    
    if (quantity === 0) {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category
      });
    } else {
      updateQuantity(item.id, quantity + 1);
    }
  };

  const handleDecreaseQuantity = (item: typeof menuItems[0]) => {
    const quantity = getItemQuantity(item.id);
    
    if (quantity === 1) {
      removeItem(item.id);
    } else if (quantity > 0) {
      updateQuantity(item.id, quantity - 1);
    }
  };

  const categories = ['All', 'Pizza', 'Pasta', 'Seafood', 'Dessert'];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Background - Extended to cover navbar */}
      <div 
        className="relative py-32 pt-24 bg-cover bg-center bg-no-repeat !mt-0 !pt-[150px]"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${heroSpecial})`
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
              Delicious <span className="text-warm-orange bg-gradient-to-r from-warm-orange to-deep-red bg-clip-text text-transparent">Flavors</span>
            </h1>
            <h2 className="text-2xl md:text-3xl text-white/90 mb-8 font-light">
              Crafted with Passion, Served with Love
            </h2>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className={selectedCategory === category 
                ? "bg-warm-orange hover:bg-warm-orange/90 text-white" 
                : "hover:bg-warm-orange hover:text-white hover:border-warm-orange"
              }
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-card rounded-2xl shadow-soft overflow-hidden transition-all duration-300 cursor-pointer ${
                hoveredItem === item.id ? 'shadow-warm scale-105' : 'hover:shadow-warm hover:scale-105'
              }`}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className={`w-full h-full object-cover transition-transform duration-300 ${
                    hoveredItem === item.id ? 'scale-110' : ''
                  }`}
                />
                <div className="absolute top-4 right-4">
                  <span className="bg-warm-orange text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {item.category}
                  </span>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="bg-deep-red text-white px-3 py-1 rounded-full text-sm font-bold">
                    {item.discount}% OFF
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-foreground">{item.name}</h3>
                  {item.isHighProtein && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                      High Protein
                    </span>
                  )}
                </div>
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">⏱️ Prep time:</span>
                    <span className="font-medium">{item.prepTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">👥 Serves:</span>
                    <span className="font-medium">{item.serving}</span>
                  </div>
                  {item.spiceLevel && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Spice level:</span>
                      <span className="font-medium">{item.spiceLevel}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">🔥 Calories:</span>
                    <span className="font-medium">{item.calories} kcal</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">💪 Protein:</span>
                    <span className="font-medium">{item.protein}g</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl font-bold text-warm-orange">{item.priceDisplay}</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                        {item.discount}% OFF
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground line-through">{item.originalPriceDisplay}</span>
                  </div>
                  
                  {getItemQuantity(item.id) === 0 ? (
                    <Button 
                      className="bg-gradient-warm hover:opacity-90"
                      onClick={() => handleAddToCart(item)}
                    >
                      Add to Cart
                    </Button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-10 w-10 rounded-full hover:bg-warm-orange/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDecreaseQuantity(item);
                        }}
                      >
                        <Minus className="h-5 w-5" />
                      </Button>
                      
                      <span className="w-10 text-center text-lg font-bold text-warm-orange">
                        {getItemQuantity(item.id)}
                      </span>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-10 w-10 rounded-full hover:bg-warm-orange/10" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(item);
                        }}
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Menu;