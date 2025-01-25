import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Trash2 } from "lucide-react"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { useUser } from "@clerk/clerk-react"

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([])
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      fetchWishlistItems()
    }
  }, [user])

  const fetchWishlistItems = async () => {
    try {
      const response = await fetch(`http://localhost:6003/api/wishlist/${user.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch wishlist items")
      }
      const data = await response.json()
    //   console.log(data);
      setWishlistItems(data)
    } catch (error) {
      console.error("Error fetching wishlist items:", error)
    }
  }

  const removeFromWishlist = async (menuItemId) => {
    try {
      const response = await fetch("http://localhost:6003/api/wishlist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id, menuItemId }),
      })
      if (!response.ok) {
        throw new Error("Failed to remove item from wishlist")
      }
      fetchWishlistItems() // Refresh the wishlist
    } catch (error) {
      console.error("Error removing item from wishlist:", error)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Your Wishlist</h1>
        {wishlistItems.length === 0 ? (
          <div className="text-center">
            <p className="text-xl mb-4">Your wishlist is empty</p>
            <Link
              to="/menu"
              className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-md p-6 relative">
                <img
                  src={item.imageUrl || "/placeholder.svg"}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">₹{item.price}</span>
                  <button onClick={() => removeFromWishlist(item._id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default WishlistPage

