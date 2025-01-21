import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const CheckoutPage = () => {
  const [cart, setCart] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [deliveryOption, setDeliveryOption] = useState("takeaway");
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '{}');
    setCart(savedCart);
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu-items');
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const calculateSubtotal = () => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = menuItems.find(item => item._id === itemId);
      return total + (item ? item.price * quantity : 0);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const deliveryFee = deliveryOption === "delivery" ? 20 : 0;
    return subtotal + deliveryFee;
  };

  const handlePayment = () => {
    // Here you would typically integrate with a payment gateway
    // For this example, we'll just simulate a successful payment
    localStorage.removeItem('cart');
    navigate('/order-status');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
            {Object.entries(cart).map(([itemId, quantity]) => {
              const item = menuItems.find(item => item._id === itemId);
              return item ? (
                <div key={itemId} className="flex justify-between items-center mb-2">
                  <span>{item.name} x {quantity}</span>
                  <span>₹{item.price * quantity}</span>
                </div>
              ) : null;
            })}
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2">Delivery Option</h3>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="takeaway"
                    checked={deliveryOption === "takeaway"}
                    onChange={() => setDeliveryOption("takeaway")}
                    className="mr-2"
                  />
                  Takeaway (₹0)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="dine-in"
                    checked={deliveryOption === "dine-in"}
                    onChange={() => setDeliveryOption("dine-in")}
                    className="mr-2"
                  />
                  Dine-in (₹0)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="delivery"
                    checked={deliveryOption === "delivery"}
                    onChange={() => setDeliveryOption("delivery")}
                    className="mr-2"
                  />
                  Delivery (₹20)
                </label>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Bill Details</h2>
            <div className="flex justify-between items-center mb-2">
              <span>Subtotal</span>
              <span>₹{calculateSubtotal()}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span>Delivery Fee</span>
              <span>₹{deliveryOption === "delivery" ? 20 : 0}</span>
            </div>
            <div className="flex justify-between items-center font-bold text-lg mt-4">
              <span>Total</span>
              <span>₹{calculateTotal()}</span>
            </div>
            <button
              onClick={handlePayment}
              className="w-full bg-orange-500 text-white px-4 py-2 rounded-md mt-8 hover:bg-orange-600 transition-colors"
            >
              Pay Now
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
