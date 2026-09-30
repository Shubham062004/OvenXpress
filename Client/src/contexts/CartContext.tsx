// Client/src/contexts/CartContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useEffect,
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
  branchId: string | null;
  branchName: string | null;
  subtotal: number;
  totalItems: number;
  appliedCoupon: AppliedCoupon | null;
  discount: number;
  total: number;

  addItem: (
    item: Omit<CartItem, 'quantity'>,
    qty?: number,
    branchInfo?: { id: string; name: string }
  ) => boolean | 'mismatch';
  forceAddItem: (
    item: Omit<CartItem, 'quantity'>,
    qty: number,
    branchInfo: { id: string; name: string }
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setCartBranch: (branchId: string, branchName: string) => void;

  setCoupon: (coupon: AppliedCoupon | null) => void;

  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'ovenxpress_customer_cart';
const CART_BRANCH_KEY = 'ovenxpress_cart_branch';

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [branchInfo, setBranchInfoState] = useState<{ id: string | null; name: string | null }>(() => {
    try {
      const saved = localStorage.getItem(CART_BRANCH_KEY);
      return saved ? JSON.parse(saved) : { id: null, name: null };
    } catch {
      return { id: null, name: null };
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn('Failed to persist cart items:', err);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_BRANCH_KEY, JSON.stringify(branchInfo));
    } catch (err) {
      console.warn('Failed to persist cart branch:', err);
    }
  }, [branchInfo]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const discount = appliedCoupon?.discountAmount ?? 0;
  const total = Math.max(0, subtotal - discount);

  const setCartBranch = (id: string, name: string) => {
    setBranchInfoState({ id, name });
  };

  /**
   * Add item to cart.
   * If cart already contains items from a different branch, returns 'mismatch'
   * so the caller can prompt the user to clear the cart or switch branches.
   */
  const addItem = (
    item: Omit<CartItem, 'quantity'>,
    qty: number = 1,
    branch?: { id: string; name: string }
  ): boolean | 'mismatch' => {
    if (branch && branchInfo.id && branch.id !== branchInfo.id && items.length > 0) {
      return 'mismatch';
    }

    if (branch && (!branchInfo.id || items.length === 0)) {
      setBranchInfoState({ id: branch.id, name: branch.name });
    }

    setItems((prev) => {
      const existing = prev.find((x) => x.id === item.id);
      if (existing) {
        return prev.map((x) =>
          x.id === item.id ? { ...x, quantity: x.quantity + qty } : x
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });

    return true;
  };

  /**
   * Clears existing items and adds item under the new branch
   */
  const forceAddItem = (
    item: Omit<CartItem, 'quantity'>,
    qty: number = 1,
    branch: { id: string; name: string }
  ) => {
    setBranchInfoState({ id: branch.id, name: branch.name });
    setItems([{ ...item, quantity: qty }]);
    setAppliedCoupon(null);
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const next = prev.filter((x) => x.id !== id);
      if (next.length === 0) {
        setBranchInfoState({ id: null, name: null });
        setAppliedCoupon(null);
      }
      return next;
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((x) => (x.id === id ? { ...x, quantity } : x))
    );
  };

  const clearCart = () => {
    setItems([]);
    setBranchInfoState({ id: null, name: null });
    setAppliedCoupon(null);
  };

  const setCoupon = (coupon: AppliedCoupon | null) => {
    setAppliedCoupon(coupon);
  };

  const getTotal = () => total;
  const getItemCount = () => totalItems;

  const value: CartContextType = {
    items,
    branchId: branchInfo.id,
    branchName: branchInfo.name,
    subtotal,
    totalItems,
    appliedCoupon,
    discount,
    total,
    addItem,
    forceAddItem,
    removeItem,
    updateQuantity,
    clearCart,
    setCartBranch,
    setCoupon,
    getTotal,
    getItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
