import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
  notes?: string;
}

export interface AppliedCoupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description?: string;
  discountAmount: number;
}

interface CartContextType {
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  appliedCoupon: AppliedCoupon | null;
  discount: number;
  total: number;

  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;

  setCoupon: (coupon: AppliedCoupon | null) => void;

  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(
    null,
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const discount = appliedCoupon?.discountAmount ?? 0;
  const total = Math.max(0, subtotal - discount);

  const addItem = (item: Omit<CartItem, 'quantity'>, qty: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((x) => x.id === item.id);
      if (existing) {
        return prev.map((x) =>
          x.id === item.id
            ? { ...x, quantity: x.quantity + qty }
            : x,
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, quantity } : x)),
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const setCoupon = (coupon: AppliedCoupon | null) => {
    setAppliedCoupon(coupon);
  };

  const getTotal = () => total;
  const getItemCount = () => totalItems;

  const value: CartContextType = {
    items,
    subtotal,
    totalItems,
    appliedCoupon,
    discount,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setCoupon,
    getTotal,
    getItemCount,
  };

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
};
