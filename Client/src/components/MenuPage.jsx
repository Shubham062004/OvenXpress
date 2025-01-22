// import React, { useState, useEffect } from "react"
// import { Star, Minus, Plus } from "lucide-react"
// import Footer from "./Footer"

// const MenuPage = () => {
//   const [menuItems, setMenuItems] = useState([])
//   const [cart, setCart] = useState({})

//   useEffect(() => {
//     fetchMenuItems()
//     const savedCart = JSON.parse(localStorage.getItem("cart") || "{}")
//     setCart(savedCart)
//   }, [])

//   const fetchMenuItems = async () => {
//     try {
//       const response = await fetch("/api/menu-items")
//       const data = await response.json()
//       setMenuItems(data)
//     } catch (error) {
//       console.error("Error fetching menu items:", error)
//     }
//   }

//   const updateCart = (itemId, quantity) => {
//     setCart((prevCart) => {
//       const newCart = { ...prevCart, [itemId]: (prevCart[itemId] || 0) + quantity }
//       if (newCart[itemId] <= 0) {
//         delete newCart[itemId]
//       }
//       localStorage.setItem("cart", JSON.stringify(newCart))
//       return newCart
//     })
//   }

//   const groupedMenuItems = menuItems.reduce((acc, item) => {
//     if (!acc[item.category]) {
//       acc[item.category] = []
//     }
//     acc[item.category].push(item)
//     return acc
//   }, {})

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-8 text-center">Our Menu</h1>
//       {Object.entries(groupedMenuItems).map(([category, items]) => (
//         <div key={category} className="mb-12">
//           <h2 className="text-2xl font-semibold mb-4 capitalize">{category}</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {items.map((item) => (
//               <div key={item._id} className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
//                 <div className="flex justify-between items-center mb-4">
//                   <span className="text-lg font-bold">₹{item.price}</span>
//                   <div className="flex items-center">
//                     {[...Array(5)].map((_, i) => (
//                       <Star
//                         key={i}
//                         className={`w-4 h-4 ${i < Math.floor(item.rating) ? "text-yellow-400" : "text-gray-300"}`}
//                       />
//                     ))}
//                     <span className="ml-2 text-sm text-gray-600">({item.reviewCount})</span>
//                   </div>
//                 </div>
//                 {cart[item._id] ? (
//                   <div className="flex items-center justify-between border rounded-full">
//                     <button onClick={() => updateCart(item._id, -1)} className="px-3 py-1 bg-gray-200 rounded-l-full">
//                       <Minus className="w-4 h-4" />
//                     </button>
//                     <span className="px-3">{cart[item._id]}</span>
//                     <button onClick={() => updateCart(item._id, 1)} className="px-3 py-1 bg-gray-200 rounded-r-full">
//                       <Plus className="w-4 h-4" />
//                     </button>
//                   </div>
//                 ) : (
//                   <button
//                     onClick={() => updateCart(item._id, 1)}
//                     className="w-full bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors"
//                   >
//                     Add to Cart
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       ))}
//       <Footer />
//     </div>
//   )
// }

// export default MenuPage

// import { useState, useEffect } from "react";
// import { Star, Minus, Plus, Heart } from 'lucide-react';
// import Navbar from "./Navbar";
// import Footer from "./Footer";

// const MenuPage = () => {
//   const [menuItems, setMenuItems] = useState([]);
//   const [cart, setCart] = useState({});
//   const [wishlist, setWishlist] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

//   useEffect(() => {
//     fetchMenuItems();
//     const savedCart = JSON.parse(localStorage.getItem('cart') || '{}');
//     setCart(savedCart);
//     const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
//     setWishlist(savedWishlist);
//   }, []);

//   const fetchMenuItems = async () => {
//     try {
//       const response = await fetch('/api/menu-items');
//       const data = await response.json();
//       setMenuItems(data);
//       if (data.length > 0) {
//         setSelectedCategory(data[0].category);
//       }
//     } catch (error) {
//       console.error('Error fetching menu items:', error);
//     }
//   };

//   const updateCart = (itemId, quantity) => {
//     setCart(prevCart => {
//       const newCart = { ...prevCart, [itemId]: (prevCart[itemId] || 0) + quantity };
//       if (newCart[itemId] <= 0) {
//         delete newCart[itemId];
//       }
//       localStorage.setItem('cart', JSON.stringify(newCart));
//       return newCart;
//     });
//   };

//   const toggleWishlist = (itemId) => {
//     setWishlist(prevWishlist => {
//       const newWishlist = prevWishlist.includes(itemId)
//         ? prevWishlist.filter(id => id !== itemId)
//         : [...prevWishlist, itemId];
//       localStorage.setItem('wishlist', JSON.stringify(newWishlist));
//       return newWishlist;
//     });
//   };

//   const categories = [...new Set(menuItems.map(item => item.category))];

//   const filteredItems = selectedCategory
//     ? menuItems.filter(item => item.category === selectedCategory)
//     : menuItems;

//   return (
//     <div className="flex flex-col min-h-screen">
//       <Navbar />
//       <main className="flex-grow container mx-auto px-4 py-8">
//         <h1 className="text-3xl font-bold mb-8 text-center">Our Menu</h1>
//         <div className="md:hidden mb-4">
//           <button
//             onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
//             className="w-full bg-orange-500 text-white px-4 py-2 rounded-md"
//           >
//             {isCategoryMenuOpen ? 'Close Categories' : 'Open Categories'}
//           </button>
//         </div>
//         <div className="flex flex-col md:flex-row">
//           <aside className={`w-full md:w-1/5 md:pr-4 ${isCategoryMenuOpen ? 'block' : 'hidden md:block'}`}>
//             <h2 className="text-xl font-semibold mb-4">Categories</h2>
//             <ul>
//               {categories.map(category => (
//                 <li key={category}>
//                   <button
//                     onClick={() => setSelectedCategory(category)}
//                     className={`w-full text-left py-2 px-4 rounded-md ${selectedCategory === category ? 'bg-orange-500 text-white' : 'hover:bg-orange-100'}`}
//                   >
//                     {category}
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           </aside>
//           <div className="w-full md:w-4/5">
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//               {filteredItems.map((item) => (
//                 <div key={item._id} className="bg-white rounded-lg shadow-md p-6 relative">
//                   <button
//                     onClick={() => toggleWishlist(item._id)}
//                     className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
//                   >
//                     <Heart className={`w-6 h-6 ${wishlist.includes(item._id) ? 'fill-current text-red-500' : ''}`} />
//                   </button>
//                   <img src={item.imageUrl || "/placeholder.svg"} alt={item.name} className="w-full h-48 object-cover rounded-md mb-4" />
//                   <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
//                   <div className="flex justify-between items-center mb-4">
//                     <span className="text-lg font-bold">₹{item.price}</span>
//                     <div className="flex items-center">
//                       {[...Array(5)].map((_, i) => (
//                         <Star
//                           key={i}
//                           className={`w-4 h-4 ${
//                             i < Math.floor(item.rating) ? 'text-yellow-400' : 'text-gray-300'
//                           }`}
//                         />
//                       ))}
//                       <span className="ml-2 text-sm text-gray-600">({item.reviewCount})</span>
//                     </div>
//                   </div>
//                   {cart[item._id] ? (
//                     <div className="flex items-center justify-between border rounded-full">
//                       <button
//                         onClick={() => updateCart(item._id, -1)}
//                         className="px-3 py-1 bg-gray-200 rounded-l-full"
//                       >
//                         <Minus className="w-4 h-4" />
//                       </button>
//                       <span className="px-3">{cart[item._id]}</span>
//                       <button
//                         onClick={() => updateCart(item._id, 1)}
//                         className="px-3 py-1 bg-gray-200 rounded-r-full"
//                       >
//                         <Plus className="w-4 h-4" />
//                       </button>
//                     </div>
//                   ) : (
//                     <button
//                       onClick={() => updateCart(item._id, 1)}
//                       className="w-full bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors"
//                     >
//                       Add to Cart
//                     </button>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </main>
//       <Footer />
//     </div>
//   );
// };

// export default MenuPage;



// import { useState, useEffect } from "react";
// import { Star, Minus, Plus, Heart } from "lucide-react";
// import Navbar from "./Navbar"; // Ensure Navbar.jsx has a default export
// import Footer from "./Footer"; // Ensure Footer.jsx has a default export

// const MenuPage = () => {
//   const [menuItems, setMenuItems] = useState([]);
//   const [cart, setCart] = useState({});
//   const [wishlist, setWishlist] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

//   useEffect(() => {
//     fetchMenuItems();
//     const savedCart = JSON.parse(localStorage.getItem("cart") || "{}");
//     setCart(savedCart);
//     const savedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
//     setWishlist(savedWishlist);
//   }, []);

//   const fetchMenuItems = async () => {
//     try {
//       const response = await fetch("/api/menu-items");
//       const data = await response.json();
//       setMenuItems(data);
//       if (data.length > 0) {
//         setSelectedCategory(data[0].category);
//       }
//     } catch (error) {
//       console.error("Error fetching menu items:", error);
//     }
//   };

//   const updateCart = (itemId, quantity) => {
//     setCart((prevCart) => {
//       const newCart = { ...prevCart, [itemId]: (prevCart[itemId] || 0) + quantity };
//       if (newCart[itemId] <= 0) {
//         delete newCart[itemId];
//       }
//       localStorage.setItem("cart", JSON.stringify(newCart));
//       return newCart;
//     });
//   };

//   const toggleWishlist = (itemId) => {
//     setWishlist((prevWishlist) => {
//       const newWishlist = prevWishlist.includes(itemId)
//         ? prevWishlist.filter((id) => id !== itemId)
//         : [...prevWishlist, itemId];
//       localStorage.setItem("wishlist", JSON.stringify(newWishlist));
//       return newWishlist;
//     });
//   };

//   const categories = [...new Set(menuItems.map((item) => item.category))];

//   const filteredItems = selectedCategory
//     ? menuItems.filter((item) => item.category === selectedCategory)
//     : menuItems;

//   return (
//     <div className="flex flex-col min-h-screen">
//       <Navbar />
//       <main className="flex-grow container mx-auto px-4 py-8">
//         <h1 className="text-3xl font-bold mb-8 text-center">Our Menu</h1>
//         <div className="md:hidden mb-4">
//           <button
//             onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
//             className="w-full bg-orange-500 text-white px-4 py-2 rounded-md"
//           >
//             {isCategoryMenuOpen ? "Close Categories" : "Open Categories"}
//           </button>
//         </div>
//         <div className="flex flex-col md:flex-row">
//           <aside
//             className={`w-full md:w-1/5 md:pr-4 ${
//               isCategoryMenuOpen ? "block" : "hidden md:block"
//             }`}
//           >
//             <h2 className="text-xl font-semibold mb-4">Categories</h2>
//             <ul>
//               {categories.map((category) => (
//                 <li key={category}>
//                   <button
//                     onClick={() => setSelectedCategory(category)}
//                     className={`w-full text-left py-2 px-4 rounded-md ${
//                       selectedCategory === category
//                         ? "bg-orange-500 text-white"
//                         : "hover:bg-orange-100"
//                     }`}
//                   >
//                     {category}
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           </aside>
//           <div className="w-full md:w-4/5">
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//               {filteredItems.map((item) => (
//                 <div key={item._id} className="bg-white rounded-lg shadow-md p-6 relative">
//                   <button
//                     onClick={() => toggleWishlist(item._id)}
//                     className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
//                   >
//                     <Heart
//                       className={`w-6 h-6 ${
//                         wishlist.includes(item._id) ? "fill-current text-red-500" : ""
//                       }`}
//                     />
//                   </button>
//                   <img
//                     src={item.imageUrl || "/placeholder.svg"}
//                     alt={item.name}
//                     className="w-full h-48 object-cover rounded-md mb-4"
//                   />
//                   <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
//                   <div className="flex justify-between items-center mb-4">
//                     <span className="text-lg font-bold">₹{item.price}</span>
//                     <div className="flex items-center">
//                       {[...Array(5)].map((_, i) => (
//                         <Star
//                           key={i}
//                           className={`w-4 h-4 ${
//                             i < Math.floor(item.rating) ? "text-yellow-400" : "text-gray-300"
//                           }`}
//                         />
//                       ))}
//                       <span className="ml-2 text-sm text-gray-600">({item.reviewCount})</span>
//                     </div>
//                   </div>
//                   {cart[item._id] ? (
//                     <div className="flex items-center justify-between border rounded-full">
//                       <button
//                         onClick={() => updateCart(item._id, -1)}
//                         className="px-3 py-1 bg-gray-200 rounded-l-full"
//                       >
//                         <Minus className="w-4 h-4" />
//                       </button>
//                       <span className="px-3">{cart[item._id]}</span>
//                       <button
//                         onClick={() => updateCart(item._id, 1)}
//                         className="px-3 py-1 bg-gray-200 rounded-r-full"
//                       >
//                         <Plus className="w-4 h-4" />
//                       </button>
//                     </div>
//                   ) : (
//                     <button
//                       onClick={() => updateCart(item._id, 1)}
//                       className="w-full bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors"
//                     >
//                       Add to Cart
//                     </button>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </main>
//       <Footer />
//     </div>
//   );
// };

// export default MenuPage;



import { useState, useEffect } from "react";
import { Star, Minus, Plus, Heart } from "lucide-react";
import Navbar from "./Navbar"; // Ensure Navbar.jsx has a default export
import Footer from "./Footer"; // Ensure Footer.jsx has a default export

const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState({});
  const [wishlist, setWishlist] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  useEffect(() => {
    fetchMenuItems();
    const savedCart = JSON.parse(localStorage.getItem("cart") || "{}");
    setCart(savedCart);
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setWishlist(savedWishlist);
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch("http://localhost:6001/api/menu-items");
      if (!response.ok) {
        throw new Error("Failed to fetch menu items");
      }
      const data = await response.json();
      setMenuItems(data);
      if (data.length > 0) {
        setSelectedCategory(data[0].category);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  const updateCart = (itemId, quantity) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart, [itemId]: (prevCart[itemId] || 0) + quantity };
      if (newCart[itemId] <= 0) {
        delete newCart[itemId];
      }
      localStorage.setItem("cart", JSON.stringify(newCart));
      return newCart;
    });
  };

  const toggleWishlist = (itemId) => {
    setWishlist((prevWishlist) => {
      const newWishlist = prevWishlist.includes(itemId)
        ? prevWishlist.filter((id) => id !== itemId)
        : [...prevWishlist, itemId];
      localStorage.setItem("wishlist", JSON.stringify(newWishlist));
      return newWishlist;
    });
  };

  const categories = [...new Set(menuItems.map((item) => item.category))];

  const filteredItems = selectedCategory
    ? menuItems.filter((item) => item.category === selectedCategory)
    : menuItems;

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
          <aside
            className={`w-full md:w-1/5 md:pr-4 ${
              isCategoryMenuOpen ? "block" : "hidden md:block"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            <ul>
              {categories.map((category) => (
                <li key={category}>
                  <button
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left py-2 px-4 rounded-md ${
                      selectedCategory === category
                        ? "bg-orange-500 text-white"
                        : "hover:bg-orange-100"
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
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                  >
                    <Heart
                      className={`w-6 h-6 ${
                        wishlist.includes(item._id) ? "fill-current text-red-500" : ""
                      }`}
                    />
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
                            i < Math.floor(item.rating) ? "text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">({item.reviewCount})</span>
                    </div>
                  </div>
                  {cart[item._id] ? (
                    <div className="flex items-center justify-between border rounded-full">
                      <button
                        onClick={() => updateCart(item._id, -1)}
                        className="px-3 py-1 bg-gray-200 rounded-l-full"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3">{cart[item._id]}</span>
                      <button
                        onClick={() => updateCart(item._id, 1)}
                        className="px-3 py-1 bg-gray-200 rounded-r-full"
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
