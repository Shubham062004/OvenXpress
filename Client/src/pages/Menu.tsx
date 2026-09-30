// Client/src/pages/Menu.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useBranch } from '@/contexts/BranchContext';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Minus,
  Loader2,
  Search,
  Filter,
  MapPin,
  Clock,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { menuAPI } from '@/services/api';

interface MenuItem {
  _id: string;
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  prepTime?: number;
  isSpecial?: boolean;
  isPopular?: boolean;
  isAvailable?: boolean;
}

const Menu = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Branch mismatch modal state
  const [conflictItem, setConflictItem] = useState<MenuItem | null>(null);

  const {
    addItem,
    forceAddItem,
    items,
    updateQuantity,
    removeItem,
    branchName: cartBranchName,
  } = useCart();
  const { selectedBranch, setIsBranchModalOpen } = useBranch();
  const { toast } = useToast();

  const heroSpecial = '/hero-special.jpg';

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setIsLoading(true);

        const params: Record<string, any> = { available: true };
        if (selectedBranch?.id) {
          params.branchId = selectedBranch.id;
        }

        const menuResponse = await menuAPI.getAllItems(params);
        const payload =
          menuResponse.data && menuResponse.data.data
            ? menuResponse.data.data
            : menuResponse.data;
        const rawItems: MenuItem[] = Array.isArray(payload) ? payload : [];

        const itemsWithImage: MenuItem[] = rawItems.map((it) => ({
          ...it,
          _id: it.id || it._id,
          image: it.image || it.imageUrl || '/placeholder.svg',
        }));

        setMenuItems(itemsWithImage);

        const categoriesResponse = await menuAPI.getCategories();
        const catPayload =
          categoriesResponse.data && categoriesResponse.data.data
            ? categoriesResponse.data.data
            : categoriesResponse.data;
        const categoriesData: string[] = Array.isArray(catPayload)
          ? catPayload
          : [];
        setCategories(['all', ...categoriesData]);

        setError(null);
      } catch (err) {
        console.error('Error fetching menu data:', err);
        setError('Failed to load menu. Please check your connection.');
        setCategories(['all', 'Pizzas', 'Burgers', 'Sides & Appetizers', 'Beverages', 'Desserts']);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuData();
  }, [selectedBranch?.id]);

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
    const branchInfo = selectedBranch
      ? { id: selectedBranch.id, name: selectedBranch.name }
      : undefined;

    const result = addItem(
      {
        id: item._id,
        name: item.name,
        price: item.price,
        image: item.image || '/placeholder.svg',
        category: item.category,
      },
      1,
      branchInfo
    );

    if (result === 'mismatch') {
      setConflictItem(item);
      return;
    }

    toast({
      title: 'Added to cart',
      description: `${item.name} has been added to your cart.`,
    });
  };

  const handleConfirmConflict = () => {
    if (conflictItem && selectedBranch) {
      forceAddItem(
        {
          id: conflictItem._id,
          name: conflictItem.name,
          price: conflictItem.price,
          image: conflictItem.image || '/placeholder.svg',
          category: conflictItem.category,
        },
        1,
        { id: selectedBranch.id, name: selectedBranch.name }
      );
      toast({
        title: 'Cart Updated',
        description: `Cart cleared and switched to ${selectedBranch.name}.`,
      });
      setConflictItem(null);
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

  const formatPrepTime = (prepTime?: number) => {
    if (!prepTime) return '15-20 mins';
    return `${prepTime} mins`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div
        className="relative py-28 pt-24 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.75),rgba(0,0,0,0.85)), url(${heroSpecial})`,
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
              Artisanal <span className="text-warm-orange">Craft Menu</span>
            </h1>
            <p className="text-lg sm:text-xl text-neutral-300 font-light">
              Fresh sourdough crusts, slow-simmered sauces, and premium ingredients.
            </p>

            {/* Branch Context Banner in Hero */}
            <div className="pt-2 inline-flex items-center gap-3 bg-neutral-900/90 border border-neutral-700/80 px-4 py-2 rounded-2xl backdrop-blur-md shadow-xl text-sm">
              <MapPin className="w-4 h-4 text-warm-orange shrink-0" />
              <div className="text-left text-xs sm:text-sm">
                <span className="text-neutral-400">Ordering from: </span>
                <strong className="text-white">
                  {selectedBranch ? selectedBranch.name : 'All Locations'}
                </strong>
                {selectedBranch?.city && (
                  <span className="text-neutral-400"> ({selectedBranch.city})</span>
                )}
              </div>
              <button
                onClick={() => setIsBranchModalOpen(true)}
                className="ml-2 text-xs font-semibold text-warm-orange hover:text-white underline underline-offset-4"
              >
                Change
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading branch menu...</span>
          </div>
        ) : error ? (
          <div className="text-center max-w-md mx-auto py-12">
            <div className="text-red-500 p-4 border border-red-800/40 rounded-xl mb-4 bg-red-950/40">
              <p>{error}</p>
            </div>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        ) : (
          <>
            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pizzas, burgers, drinks, desserts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 text-sm bg-neutral-900 border-neutral-800 rounded-xl"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground self-center">
                <Filter className="h-4 w-4 text-warm-orange" />
                <span>Filter by Category</span>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap justify-center gap-2.5 mb-10">
              {categories.map((category) => {
                const isSelected = selectedCategory === category;
                return (
                  <Button
                    key={category}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-warm-orange hover:bg-warm-orange/90 text-white shadow-md shadow-warm-orange/20'
                        : 'hover:bg-neutral-800 text-neutral-300 border-neutral-800'
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category === 'all' ? 'All Items' : category}
                  </Button>
                );
              })}
            </div>

            {/* Item Counter */}
            <div className="text-center mb-8">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Showing <strong className="text-foreground">{filteredItems.length}</strong>{' '}
                {filteredItems.length === 1 ? 'item' : 'items'}
                {selectedCategory !== 'all' && <span> in {selectedCategory}</span>}
                {searchTerm && <span> matching &ldquo;{searchTerm}&rdquo;</span>}
              </p>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.length === 0 ? (
                <div className="col-span-full text-center py-16 bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-8 space-y-3">
                  <p className="text-muted-foreground text-base">
                    {searchTerm
                      ? 'No items found matching your search.'
                      : 'No items found in this category for this branch.'}
                  </p>
                  <div className="flex gap-2 justify-center pt-2">
                    {searchTerm && (
                      <Button onClick={() => setSearchTerm('')} variant="outline" size="sm">
                        Clear Search
                      </Button>
                    )}
                    <Button onClick={() => setSelectedCategory('all')} variant="outline" size="sm">
                      View All Items
                    </Button>
                  </div>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item._id}
                    className={`bg-card rounded-2xl border border-neutral-800 overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                      hoveredItem === item._id ? 'shadow-xl shadow-red-950/30 -translate-y-1' : ''
                    }`}
                    onMouseEnter={() => setHoveredItem(item._id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <div>
                      {/* Image Frame */}
                      <div className="relative h-48 overflow-hidden bg-neutral-900">
                        <img
                          src={item.image || '/placeholder.svg'}
                          alt={item.name}
                          className={`w-full h-full object-cover transition-transform duration-300 ${
                            hoveredItem === item._id ? 'scale-105' : ''
                          }`}
                        />
                        <div className="absolute top-3 right-3">
                          <span className="bg-neutral-950/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-neutral-700">
                            {item.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-2">
                        <h3 className="text-lg font-bold text-foreground leading-snug line-clamp-1">
                          {item.name}
                        </h3>

                        {item.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        <div className="pt-2 flex items-center gap-1.5 text-xs text-neutral-400">
                          <Clock className="w-3.5 h-3.5 text-warm-orange" />
                          <span>Prep time: {formatPrepTime(item.prepTime)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="p-5 pt-0 border-t border-neutral-800/80 mt-2 flex items-center justify-between">
                      <span className="text-2xl font-black text-warm-orange">
                        ₹{item.price}
                      </span>

                      {getItemQuantity(item._id) === 0 ? (
                        <Button
                          size="sm"
                          className="bg-warm-orange hover:bg-warm-orange/90 text-white text-xs px-4 rounded-xl"
                          onClick={() => handleAddToCart(item)}
                        >
                          Add to Cart
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg hover:bg-neutral-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDecreaseQuantity(item);
                            }}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>

                          <span className="w-6 text-center text-sm font-bold text-warm-orange">
                            {getItemQuantity(item._id)}
                          </span>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg hover:bg-neutral-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(item);
                            }}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Multi-Branch Cart Conflict Modal */}
      {conflictItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-800/60 text-amber-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Different Branch Selected</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Your cart currently has items from{' '}
                  <strong className="text-white">{cartBranchName || 'another branch'}</strong>.
                  Each order must be prepared by a single kitchen.
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
              Clear your cart and add <strong>{conflictItem.name}</strong> from{' '}
              <strong>{selectedBranch?.name}</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setConflictItem(null)}
              >
                Keep Current Cart
              </Button>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
                onClick={handleConfirmConflict}
              >
                Clear &amp; Add Item
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
