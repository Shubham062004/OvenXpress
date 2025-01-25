import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
// import Footer from "./Footer"
import { useUser } from "@clerk/clerk-react"

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([])
  const [deliveryOption, setDeliveryOption] = useState("takeaway")
  const [isLoading, setIsLoading] = useState(true)
  const [paymentError, setPaymentError] = useState(null)
  const navigate = useNavigate()
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      fetchCartItems()
    }
  }, [user])

  const fetchCartItems = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`http://localhost:6003/api/cart/${user.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch cart items")
      }
      const data = await response.json()
      setCartItems(data)
    } catch (error) {
      console.error("Error fetching cart items:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const deliveryFee = deliveryOption === "delivery" ? 20 : 0
    return subtotal + deliveryFee
  }

  const handlePayment = async () => {
    setPaymentError(null)
    try {
      // Here you would typically integrate with a payment gateway
      // For this example, we'll just simulate a successful payment
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate API call

      // Clear the cart after successful payment
      await fetch(`http://localhost:6003/api/cart/${user.id}`, {
        method: "DELETE",
      })

      navigate("/order-status")
    } catch (error) {
      console.error("Payment error:", error)
      setPaymentError("An error occurred during payment. Please try again.")
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
            {isLoading ? (
              <p>Loading order details...</p>
            ) : (
              cartItems.map((item) => (
                <div key={item._id} className="flex justify-between items-center mb-2">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))
            )}
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
            {paymentError && <p className="text-red-500 mt-4">{paymentError}</p>}
            <button
              onClick={handlePayment}
              className="w-full bg-orange-500 text-white px-4 py-2 rounded-md mt-8 hover:bg-orange-600 transition-colors"
            >
              Pay Now
            </button>
          </div>
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  )
}

export default CheckoutPage

