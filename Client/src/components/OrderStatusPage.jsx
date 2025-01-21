import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const OrderStatusPage = () => {
  const [status, setStatus] = useState("confirmed");

  useEffect(() => {
    // In a real application, you would fetch the order status from the backend
    // For this example, we'll simulate status changes
    const statusSequence = ["confirmed", "preparing", "ready"];
    let currentIndex = 0;

    const interval = setInterval(() => {
      setStatus(statusSequence[currentIndex]);
      currentIndex = (currentIndex + 1) % statusSequence.length;
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusEmoji = () => {
    switch (status) {
      case "confirmed":
        return "✅";
      case "preparing":
        return "👨‍🍳";
      case "ready":
        return "🍽️";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Order Status</h1>
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <span className="text-6xl mb-4">{getStatusEmoji()}</span>
            <h2 className="text-2xl font-semibold mb-4">
              Your order is {status}
            </h2>
            <p className="text-gray-600">
              {status === "confirmed" && "We've received your order and are processing it."}
              {status === "preparing" && "Our chefs are preparing your delicious meal."}
              {status === "ready" && "Your order is ready for pickup or on its way!"}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderStatusPage;
