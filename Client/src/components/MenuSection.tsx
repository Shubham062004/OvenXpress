import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import pastaCarbonara from '@/assets/pasta-carbonara.jpg';
import grilledSalmon from '@/assets/grilled-salmon.jpg';
import tiramisuDessert from '@/assets/tiramisu-dessert.jpg';
import heroSpecial from '@/assets/hero-special.jpg';

const MenuSection = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const { addItem, items, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 1,
      name: "Margherita Pizza",
      category: "Pizza",
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
    },
    {
      id: 2,
      name: "Carbonara Pasta",
      category: "Pasta",
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
    },
    {
      id: 3,
      name: "Grilled Salmon",
      category: "Seafood",
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
    },
    {
      id: 4,
      name: "Tiramisu",
      category: "Dessert",
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
    },
    {
      id: 5,
      name: "Pepperoni Pizza",
      category: "Pizza",
      originalPrice: 449,
      price: 349,
      originalPriceDisplay: '₹449',
      priceDisplay: '₹349',
      discount: 22,
      prepTime: '15-20 mins',
      serving: '2 people',
      spiceLevel: '🌶️',
      calories: 920,
      protein: 38,
      isHighProtein: true,
      image: heroSpecial,
    },
    {
      id: 6,
      name: "Chicken Alfredo",
      category: "Pasta",
      originalPrice: 549,
      price: 449,
      originalPriceDisplay: '₹549',
      priceDisplay: '₹449',
      discount: 18,
      prepTime: '20-25 mins',
      serving: '1 person',
      spiceLevel: '',
      calories: 780,
      protein: 42,
      isHighProtein: true,
      image: pastaCarbonara,
    },
    {
      id: 7,
      name: "Caesar Salad",
      category: "Salad",
      originalPrice: 299,
      price: 249,
      originalPriceDisplay: '₹299',
      priceDisplay: '₹249',
      discount: 17,
      prepTime: '10-15 mins',
      serving: '1 person',
      spiceLevel: '',
      calories: 320,
      protein: 12,
      isHighProtein: false,
      image: grilledSalmon,
    },
    {
      id: 8,
      name: "Chocolate Lava Cake",
      category: "Dessert",
      originalPrice: 229,
      price: 179,
      originalPriceDisplay: '₹229',
      priceDisplay: '₹179',
      discount: 22,
      prepTime: '5-10 mins',
      serving: '1 person',
      spiceLevel: '',
      calories: 480,
      protein: 6,
      isHighProtein: false,
      image: tiramisuDessert,
    },
    {
      id: 9,
      name: "Chicken Biryani",
      category: "Rice",
      originalPrice: 499,
      price: 399,
      originalPriceDisplay: '₹499',
      priceDisplay: '₹399',
      discount: 20,
      prepTime: '30-35 mins',
      serving: '1 person',
      spiceLevel: '🌶️🌶️',
      calories: 720,
      protein: 35,
      isHighProtein: true,
      image: heroSpecial,
    },
    {
      id: 10,
      name: "Butter Chicken",
      category: "Curry",
      originalPrice: 529,
      price: 429,
      originalPriceDisplay: '₹529',
      priceDisplay: '₹429',
      discount: 19,
      prepTime: '25-30 mins',
      serving: '1 person',
      spiceLevel: '🌶️',
      calories: 650,
      protein: 40,
      isHighProtein: true,
      image: pastaCarbonara,
    },
    {
      id: 11,
      name: "Garlic Naan",
      category: "Bread",
      originalPrice: 119,
      price: 89,
      originalPriceDisplay: '₹119',
      priceDisplay: '₹89',
      discount: 25,
      prepTime: '10-12 mins',
      serving: '2 pieces',
      spiceLevel: '',
      calories: 280,
      protein: 8,
      isHighProtein: false,
      image: grilledSalmon,
    },
    {
      id: 12,
      name: "Mango Kulfi",
      category: "Dessert",
      originalPrice: 189,
      price: 149,
      originalPriceDisplay: '₹189',
      priceDisplay: '₹149',
      discount: 21,
      prepTime: '5 mins',
      serving: '1 person',
      spiceLevel: '',
      calories: 340,
      protein: 5,
      isHighProtein: false,
      image: tiramisuDessert,
    },
  ];

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

  return (
    <section id="menu" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-rich-brown mb-4">
            hot and fresh food menu
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {menuItems.map((item, index) => (
            <div
              key={item.id}
              className={`bg-card rounded-2xl shadow-soft overflow-hidden transition-all duration-300 cursor-pointer ${
                hoveredCard === item.id ? 'shadow-warm scale-105' : 'hover:shadow-warm hover:scale-105'
              }`}
              onMouseEnter={() => setHoveredCard(item.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className={`w-full h-full object-cover transition-transform duration-300 ${
                    hoveredCard === item.id ? 'scale-110' : ''
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

        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg" 
            className="border-warm-orange text-warm-orange hover:text-white" 
            style={{ backgroundColor: 'hsl(var(--warm-orange))' }}
            onClick={() => navigate('/menu')}
          >
            View Complete Menu
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MenuSection;