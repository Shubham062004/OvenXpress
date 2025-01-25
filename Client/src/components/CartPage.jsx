import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Minus, Plus, Trash2 } from "lucide-react"
import Navbar from "./Navbar"
// import Footer from "./Footer"
import { useUser } from "@clerk/clerk-react"

const CartPage = () => {
  const [cartItems, setCartItems] = useState([])
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      fetchCartItems()
    }
  }, [user])

  const fetchCartItems = async () => {
    try {
      const response = await fetch(`http://localhost:6003/api/cart/${user.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch cart items")
      }
      const data = await response.json()
      setCartItems(data)
    } catch (error) {
      console.error("Error fetching cart items:", error)
    }
  }

  const updateCartItem = async (menuItemId, quantity) => {
    try {
      const response = await fetch("http://localhost:6003/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id, menuItemId, quantity }),
      })
      if (!response.ok) {
        throw new Error("Failed to update cart item")
      }
      fetchCartItems() // Refresh the cart
    } catch (error) {
      console.error("Error updating cart item:", error)
    }
  }

  const removeFromCart = async (menuItemId) => {
    try {
      const response = await fetch("http://localhost:6003/api/cart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id, menuItemId }),
      })
      if (!response.ok) {
        throw new Error("Failed to remove item from cart")
      }
      fetchCartItems() // Refresh the cart
    } catch (error) {
      console.error("Error removing item from cart:", error)
    }
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Your Cart</h1>
        {cartItems.length === 0 ? (
          <div className="text-center">
            <p className="text-xl mb-4">Your cart is empty</p>
            <Link
              to="/menu"
              className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div>
            {cartItems.map((item) => (
              <div key={item._id} className="flex items-center justify-between border-b py-4">
                <div className="flex items-center">
                  <img
                    src={item.imageUrl || "/placeholder.svg"}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md mr-4"
                  />
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-600">₹{item.price} each</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => updateCartItem(item._id, item.quantity - 1)}
                    className="p-1 bg-gray-200 rounded-full"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="mx-2">{item.quantity}</span>
                  <button
                    onClick={() => updateCartItem(item._id, item.quantity + 1)}
                    className="p-1 bg-gray-200 rounded-full"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button onClick={() => removeFromCart(item._id)} className="ml-4 text-red-500">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            <div className="mt-8 flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Total: ₹{calculateTotal()}</h2>
              <Link
                to="/checkout"
                className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </main>
      {/* <Footer /> */}
    </div>
  )
}

export default CartPage

