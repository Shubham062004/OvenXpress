import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const UserDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchWishlist();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/user/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/user/wishlist');
      const data = await response.json();
      setWishlist(data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">User Dashboard</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Your Orders</h2>
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-md p-4 mb-4">
                <h3 className="font-semibold">Order #{order._id}</h3>
                <p>Status: {order.status}</p>
                <p>Total: ₹{order.total}</p>
                <ul className="mt-2">
                  {order.items.map((item) => (
                    <li key={item._id}>
                      {item.name} x {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Your Wishlist</h2>
            {wishlist.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-md p-4 mb-4">
                <h3 className="font-semibold">{item.name}</h3>
                <p>Price: ₹{item.price}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserDashboard;
