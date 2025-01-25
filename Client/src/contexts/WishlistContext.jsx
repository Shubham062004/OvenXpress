import { createContext, useState, useContext, useEffect } from "react"
import PropTypes from "prop-types"
import { useUser } from "@clerk/clerk-react"

const WishlistContext = createContext()

export const useWishlist = () => useContext(WishlistContext)

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([])
  const { user } = useUser()

  useEffect(() => {
    if (user) {
      fetchWishlist()
    }
  }, [user])

  const fetchWishlist = async () => {
    try {
      const response = await fetch(`http://localhost:6003/api/wishlist/${user.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch wishlist")
      }
      const data = await response.json()
      setWishlist(data)
    } catch (error) {
      console.error("Error fetching wishlist:", error)
    }
  }

  const addToWishlist = async (menuItemId) => {
    try {
      const response = await fetch("http://localhost:6003/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id, menuItemId }),
      })
      if (!response.ok) {
        throw new Error("Failed to add item to wishlist")
      }
      fetchWishlist() // Refresh the wishlist
    } catch (error) {
      console.error("Error adding item to wishlist:", error)
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
      fetchWishlist() // Refresh the wishlist
    } catch (error) {
      console.error("Error removing item from wishlist:", error)
    }
  }

  const isInWishlist = (menuItemId) => {
    return wishlist.some((item) => item._id === menuItemId)
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

WishlistProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
