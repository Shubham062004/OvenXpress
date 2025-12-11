// src/pages/Menu.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus, Loader2, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { menuAPI } from '@/services/api';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  prepTime?: number;
  isSpecial?: boolean;
  isPopular?: boolean;
}

const Menu = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem, items, updateQuantity, removeItem } = useCart();
  const { toast } = useToast();

  const heroSpecial = '/hero-special.jpg';

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setIsLoading(true);
        console.log('🍽️ Fetching menu data...');

        const menuResponse = await menuAPI.getAllItems({ available: true });
        console.log('📊 Menu API response:', menuResponse.data);

        // Normalize payload
        const payload = menuResponse.data && menuResponse.data.data ? menuResponse.data.data : menuResponse.data;
        const rawItems: MenuItem[] = Array.isArray(payload) ? payload : [];

        // add image fallback and ensure _id exists
        const itemsWithImage: MenuItem[] = rawItems.map((it) => ({
          ...it,
          image: it.image || it.imageUrl || '/placeholder.svg',
        }));

        setMenuItems(itemsWithImage);
        console.log(`✅ Loaded ${itemsWithImage.length} menu items`);

        const categoriesResponse = await menuAPI.getCategories();
        const catPayload = categoriesResponse.data && categoriesResponse.data.data ? categoriesResponse.data.data : categoriesResponse.data;
        const categoriesData: string[] = Array.isArray(catPayload) ? catPayload : [];
        setCategories(['all', ...categoriesData]);

        setError(null);
      } catch (err) {
        console.error('❌ Error fetching menu data:', err);
        setError('Failed to load menu. Please try again later.');
        setCategories(['all', 'pizza', 'burger', 'pasta', 'sides', 'desserts']);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      item.category?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      searchTerm === '' ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const getItemQuantity = (itemId: string) => {
    const cartItem = items.find((item) => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = (item: MenuItem) => {
    const quantity = getItemQuantity(item._id);
    if (quantity === 0) {
      addItem({
        id: item._id,
        name: item.name,
        price: item.price,
        image: item.image || '/placeholder.svg',
        category: item.category,
      });
      toast({
        title: 'Added to cart',
        description: `${item.name} has been added to your cart.`,
      });
    } else {
      updateQuantity(item._id, quantity + 1);
    }
  };

  const handleDecreaseQuantity = (item: MenuItem) => {
    const quantity = getItemQuantity(item._id);
    if (quantity === 1) {
      removeItem(item._id);
      toast({
        title: 'Removed from cart',
        description: `${item.name} has been removed from your cart.`,
      });
    } else if (quantity > 0) {
      updateQuantity(item._id, quantity - 1);
    }
  };

  const formatCategory = (category: string) => {
    return category ? category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';
  };

  const formatPrepTime = (prepTime?: number) => {
    if (!prepTime) return '15-20 mins';
    return `${prepTime} mins`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative py-32 pt-24 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.7),rgba(0,0,0,0.7)), url(${heroSpecial})` }}>
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">Delicious <span className="text-warm-orange">Flavors</span></h1>
            <h2 className="text-2xl md:text-3xl text-white/90 mb-8 font-light">Crafted with Passion, Served with Love</h2>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading menu...</span>
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="text-red-500 p-4 border border-red-200 rounded-md mb-4">
              <p>{error}</p>
            </div>
            <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search menu items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filter by category</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {categories.map(category => (
                <Button key={category} variant={selectedCategory === category ? 'default' : 'outline'} className={selectedCategory === category ? 'bg-warm-orange hover:bg-warm-orange/90 text-white' : 'hover:bg-warm-orange hover:text-white hover:border-warm-orange'} onClick={() => setSelectedCategory(category)}>
                  {formatCategory(category)}
                </Button>
              ))}
            </div>

            <div className="text-center mb-8">
              <p className="text-muted-foreground">
                Showing {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                {selectedCategory !== 'all' && <span> in {formatCategory(selectedCategory)}</span>}
                {searchTerm && <span> matching "{searchTerm}"</span>}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredItems.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <p className="text-muted-foreground text-lg mb-4">{searchTerm ? 'No items found matching your search.' : 'No items found in this category.'}</p>
                  <div className="flex gap-2 justify-center">
                    {searchTerm && <Button onClick={() => setSearchTerm('')} variant="outline">Clear Search</Button>}
                    <Button onClick={() => setSelectedCategory('all')} variant="outline">View All Items</Button>
                  </div>
                </div>
              ) : (
                filteredItems.map(item => (
                  <div key={item._id} className={`bg-card rounded-2xl shadow-soft overflow-hidden transition-all duration-300 cursor-pointer ${hoveredItem === item._id ? 'shadow-warm scale-105' : 'hover:shadow-warm hover:scale-105'}`} onMouseEnter={() => setHoveredItem(item._id)} onMouseLeave={() => setHoveredItem(null)}>
                    <div className="relative h-48 overflow-hidden">
                      <img src={item.image || '/placeholder.svg'} alt={item.name} className={`w-full h-full object-cover transition-transform duration-300 ${hoveredItem === item._id ? 'scale-110' : ''}`} />
                      <div className="absolute top-4 right-4">
                        <span className="bg-warm-orange text-white px-3 py-1 rounded-full text-sm font-semibold">{formatCategory(item.category)}</span>
                      </div>

                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {item.isSpecial && <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">Special</span>}
                        {item.isPopular && <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">Popular</span>}
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-foreground">{item.name}</h3>
                      </div>

                      {item.description && <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.description}</p>}

                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">⏱️ Prep time:</span>
                          <span className="font-medium">{formatPrepTime(item.prepTime)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-2xl font-bold text-warm-orange">₹{item.price}</span>
                        </div>

                        {getItemQuantity(item._id) === 0 ? (
                          <Button className="bg-gradient-warm hover:opacity-90" onClick={() => handleAddToCart(item)}>Add to Cart</Button>
                        ) : (
                          <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-warm-orange/10" onClick={(e) => { e.stopPropagation(); handleDecreaseQuantity(item); }}>
                              <Minus className="h-5 w-5" />
                            </Button>

                            <span className="w-10 text-center text-lg font-bold text-warm-orange">{getItemQuantity(item._id)}</span>

                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-warm-orange/10" onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }}>
                              <Plus className="h-5 w-5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Menu;
