import { useState, useEffect } from "react";
import { Star, Minus, Plus, Heart } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useUser } from "@clerk/clerk-react";

const MenuPage = () => {
  const { user } = useUser();
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  useEffect(() => {
    fetchMenuItems();
    if (user) {
      fetchCart();
      fetchWishlist();
    }
  }, [user]);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch("http://localhost:6003/api/menu-items");
      const data = await response.json();
      setMenuItems(data);
      if (data.length > 0) setSelectedCategory(data[0].category);
    } catch (error) {
      console.error("Error fetching menu:", error);
    }
  };

  const fetchCart = async () => {
    try {
      const response = await fetch(`http://localhost:6003/api/cart/${user.id}`);
      const data = await response.json();
      console.log(data);
      
      const cartData = data.reduce((acc, item) => ({
        ...acc,
        [item.menuItemId._id]: item.quantity
      }), {});
      setCart(cartData);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCart({});
    }
  };
  
  const fetchWishlist = async () => {
    try {
      const response = await fetch(`http://localhost:6003/api/wishlist/${user.id}`);
      const data = await response.json();
      setWishlist(data.map(item => item._id));
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setWishlist([]);
    }
  };

  const updateCart = async (itemId, quantity) => {
    try {
      await fetch("http://localhost:6003/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          itemId,
          quantity
        })
      });
      fetchCart();
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  const toggleWishlist = async (itemId) => {
    try {
      if (wishlist.includes(itemId)) {
        await fetch("http://localhost:6003/api/wishlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, itemId })
        });
      } else {
        await fetch("http://localhost:6003/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, itemId })
        });
      }
      fetchWishlist();
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };

  const categories = [...new Set(menuItems.map((item) => item.category))];
  const filteredItems = selectedCategory ? 
    menuItems.filter((item) => item.category === selectedCategory) : 
    menuItems;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Our Menu</h1>
        
        <div className="md:hidden mb-4">
          <button
            onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
            className="w-full bg-orange-500 text-white px-4 py-2 rounded-md"
          >
            {isCategoryMenuOpen ? "Close Categories" : "Open Categories"}
          </button>
        </div>

        <div className="flex flex-col md:flex-row">
          <aside className={`w-full md:w-1/5 md:pr-4 ${isCategoryMenuOpen ? "block" : "hidden md:block"}`}>
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            <ul>
              {categories.map((category) => (
                <li key={category}>
                  <button
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left py-2 px-4 rounded-md ${
                      selectedCategory === category ? 
                      "bg-orange-500 text-white" : 
                      "hover:bg-orange-100"
                    }`}
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div className="w-full md:w-4/5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div key={item._id} className="bg-white rounded-lg shadow-md p-6 relative">
                  <button
                    onClick={() => toggleWishlist(item._id)}
                    className="absolute top-2 right-2 z-10"
                  >
                    <Heart className={`w-6 h-6 ${
                      wishlist.includes(item._id) ? 
                      "text-red-500 fill-current" : 
                      "text-gray-500 hover:text-red-500"
                    }`} />
                  </button>

                  <img
                    src={item.imageUrl || "/placeholder.svg"}
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />

                  <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold">₹{item.price}</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(item.rating) ? 
                            "text-yellow-400" : 
                            "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">({item.reviewCount})</span>
                    </div>
                  </div>

                  {cart[item._id] ? (
                    <div className="flex items-center justify-between border rounded-full">
                      <button
                        onClick={() => updateCart(item._id, cart[item._id] - 1)}
                        className="px-3 py-1 bg-gray-200 rounded-l-full hover:bg-gray-300"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3">{cart[item._id]}</span>
                      <button
                        onClick={() => updateCart(item._id, cart[item._id] + 1)}
                        className="px-3 py-1 bg-gray-200 rounded-r-full hover:bg-gray-300"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => updateCart(item._id, 1)}
                      className="w-full bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MenuPage;