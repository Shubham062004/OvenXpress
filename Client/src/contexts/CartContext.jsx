import { createContext, useState, useContext, useEffect } from "react"
import PropTypes from "prop-types"  // Import PropTypes for prop validation

const CartContext = createContext()

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({})

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "{}")
    setCart(savedCart)
  }, [])

  const updateCart = (itemId, quantity) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart, [itemId]: (prevCart[itemId] || 0) + quantity }
      if (newCart[itemId] <= 0) {
        delete newCart[itemId]
      }
      localStorage.setItem("cart", JSON.stringify(newCart))
      return newCart
    })
  }

  const cartItemsCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0)

  return (
    <CartContext.Provider value={{ cart, updateCart, cartItemsCount }}>
      {children}
    </CartContext.Provider>
  )
}

// Prop validation for 'children'
CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
}
