
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  stock: number;
  quantity: number;
  category: string;
};

type CartContextType = {
  items: CartItem[];
  ready: boolean;
  addItem: (
    item: Omit<CartItem, "quantity">,
    quantity?: number
  ) => boolean;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
};

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = "henrys-store-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed: unknown = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setItems(parsed as CartItem[]);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, ready]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1): boolean => {
      if (
        !item.id ||
        !Number.isFinite(item.price) ||
        item.price <= 0 ||
        !Number.isInteger(item.stock) ||
        item.stock <= 0 ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return false;
      }

      let accepted = false;

      setItems((current) => {
        const existing = current.find((entry) => entry.id === item.id);
        const nextQuantity = (existing?.quantity ?? 0) + quantity;

        if (nextQuantity > item.stock) {
          return current;
        }

        accepted = true;

        if (existing) {
          return current.map((entry) =>
            entry.id === item.id
              ? { ...entry, ...item, quantity: nextQuantity }
              : entry
          );
        }

        return [...current, { ...item, quantity }];
      });

      return accepted;
    },
    []
  );

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 1) {
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.min(quantity, item.stock) }
          : item
      )
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        ready,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
