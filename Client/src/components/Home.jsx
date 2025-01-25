import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Utensils, Clock, Truck, Star, Minus, Plus } from "lucide-react";
import Footer from "./Footer";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import foodBowl from "../assets/6.png";
import Navbar from "./Navbar";

const HomePage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState({});
  const [reviews, setReviews] = useState([]);

  // Dynamic backend URL
  const backendUrl =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_BACKEND_URL_DEV // Local backend
    : import.meta.env.VITE_BACKEND_URL_PROD; // Production backend

  useEffect(() => {
    fetchMenuItems();
    const savedCart = JSON.parse(localStorage.getItem("cart") || "{}");
    setCart(savedCart);
    fetchReviews();
  }, []);

  // Fetch menu items from the backend
  const fetchMenuItems = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/menu-items`);
      if (!response.ok) {
        throw new Error("Failed to fetch menu items");
      }
      const data = await response.json();
      setMenuItems(data.slice(0, 8));
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  // Fetch reviews from the backend
  const fetchReviews = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/reviews`);
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  // Update cart (sync with backend)
  const updateCart = async (itemId, quantity) => {
    try {
      const userId = "user_2rwsNhX9hME5vfMDQHhyLv3IFqF"; // Replace with dynamic user ID
      const response = await fetch(`${backendUrl}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          menuItemId: itemId,
          quantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update cart");
      }

      const updatedCart = await response.json();
      setCart(updatedCart); // Update local state with the backend response
      localStorage.setItem("cart", JSON.stringify(updatedCart)); // Update localStorage
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  // Steps for "How It Works" section
  const steps = [
    {
      icon: <Utensils className="w-12 h-12 text-orange-500" />,
      title: "Pick Meals",
      description: "Choose your meals from our diverse weekly menu.",
    },
    {
      icon: <Clock className="w-12 h-12 text-orange-500" />,
      title: "Choose the Dates",
      description: "Select your preferred delivery schedule.",
    },
    {
      icon: <Truck className="w-12 h-12 text-orange-500" />,
      title: "Fast Deliveries",
      description: "Get your meals delivered fresh to your door.",
    },
  ];

  return (
    <div>
      <Navbar />
      {/* Hero Section */}
      <section className="pt-24 pb-12 overflow-hidden relative">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Your Favourite Food Delivered Hot & Fresh
              </h1>
              <p className="text-gray-600 mb-8">
                Healthy switched chef&apos;s do all the prep work, like peeling, chopping & marinating, so you can cook a
                fresh food.
              </p>
              <Link
                to="/menu"
                className="inline-flex items-center bg-orange-500 text-white px-8 py-3 rounded-full hover:bg-orange-600 transition-colors"
              >
                Order Now →
              </Link>
            </div>
            <div className="relative">
              <img
                src={foodBowl}
                alt="Fresh food bowl"
                className="rounded-full w-full h-auto"
                style={{
                  maxWidth: "600px",
                  maxHeight: "600px",
                  objectFit: "cover",
                }}
              />
            </div>
          </div>
        </div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-500 rounded-full opacity-20" />
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We bring you the best possible meal experience with our simple three-step process
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Our Best Menu Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Explore Our Best Menu</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {menuItems.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src={item.imageUrl || "/placeholder.svg"} // Ensure placeholder image exists
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(item.rating) ? "text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">({item.reviewCount})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">₹{item.price}</span>
                    {cart[item._id] ? (
                      <div className="flex items-center border rounded-full">
                        <button
                          onClick={() => updateCart(item._id, -1)}
                          className="px-2 py-1 bg-gray-200 rounded-l-full"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3">{cart[item._id]}</span>
                        <button
                          onClick={() => updateCart(item._id, 1)}
                          className="px-2 py-1 bg-gray-200 rounded-r-full"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => updateCart(item._id, 1)}
                        className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/menu"
              className="inline-flex items-center bg-orange-500 text-white px-8 py-3 rounded-full hover:bg-orange-600 transition-colors"
            >
              View Full Menu →
            </Link>
          </div>
        </div>
      </section>

      {/* Our Happy Customers Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Happy Customers</h2>
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              768: {
                slidesPerView: 3,
              },
              1024: {
                slidesPerView: 4,
              },
            }}
          >
            {reviews.map((review) => (
              <SwiperSlide key={review._id}>
                <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
                  <div className="flex-grow mb-4">
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{review.userName}</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;