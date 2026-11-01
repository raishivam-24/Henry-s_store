
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
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

type AuthResponse = {
  success?: boolean;
  user?: {
    id: string;
    role: "customer" | "admin";
  };
};

const CartContext = createContext<CartContextType | null>(null);

const ACTIVE_KEY = "henrys-store-cart";
const GUEST_KEY = "henrys-store-guest-cart";
const USER_KEY_PREFIX = "henrys-store-cart-user-";

function getUserCartKey(userId: string) {
  return `${USER_KEY_PREFIX}${userId}`;
}

function readCart(key: string): CartItem[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is CartItem => {
      return (
        item !== null &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.price === "number" &&
        typeof item.quantity === "number" &&
        Number.isFinite(item.price) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
      );
    });
  } catch {
    localStorage.removeItem(key);
    return [];
  }
}

function mergeCarts(
  savedCart: CartItem[],
  guestCart: CartItem[]
): CartItem[] {
  const result = new Map<string, CartItem>();

  for (const item of savedCart) {
    result.set(item.id, { ...item });
  }

  for (const item of guestCart) {
    const existing = result.get(item.id);

    if (!existing) {
      result.set(item.id, { ...item });
    } else {
      result.set(item.id, {
        ...existing,
        quantity: Math.min(
          existing.quantity + item.quantity,
          Math.max(existing.stock, item.stock)
        ),
      });
    }
  }

  return Array.from(result.values());
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  const itemsRef = useRef<CartItem[]>([]);
  const userIdRef = useRef<string | null>(null);
  const readyRef = useRef(false);
  const syncQueueRef = useRef<Promise<void>>(Promise.resolve());

  const commitCart = useCallback(
    (nextItems: CartItem[], userId = userIdRef.current) => {
      itemsRef.current = nextItems;
      setItems(nextItems);

      const storageKey = userId
        ? getUserCartKey(userId)
        : GUEST_KEY;

      localStorage.setItem(
        storageKey,
        JSON.stringify(nextItems)
      );

      localStorage.setItem(
        ACTIVE_KEY,
        JSON.stringify(nextItems)
      );
    },
    []
  );

  const syncAuthentication = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      });

      const data: AuthResponse = await response
        .json()
        .catch(() => ({}));

      const authenticatedUser =
        response.ok &&
        data.success &&
        data.user?.id &&
        data.user.role === "customer"
          ? data.user
          : null;

      const previousUserId = userIdRef.current;

      if (!authenticatedUser) {
        // Save the previous customer's cart before clearing
        // the active bag after logout.
        if (previousUserId) {
          localStorage.setItem(
            getUserCartKey(previousUserId),
            JSON.stringify(itemsRef.current)
          );
        } else if (!readyRef.current) {
          // Preserve an existing guest bag from the old cart key
          // when migrating from the previous storage implementation.
          const oldCart = readCart(ACTIVE_KEY);
          const guestCart = readCart(GUEST_KEY);

          if (guestCart.length === 0 && oldCart.length > 0) {
            localStorage.setItem(
              GUEST_KEY,
              JSON.stringify(oldCart)
            );
          }
        }

        userIdRef.current = null;
        commitCart(readCart(GUEST_KEY), null);

        return;
      }

      const nextUserId = authenticatedUser.id;

      // No need to reload if the same customer is still signed in.
      if (previousUserId === nextUserId) return;

      // Save the previous account before switching accounts.
      if (previousUserId) {
        localStorage.setItem(
          getUserCartKey(previousUserId),
          JSON.stringify(itemsRef.current)
        );
      }

      const savedUserCart = readCart(
        getUserCartKey(nextUserId)
      );

      const guestCart = readCart(GUEST_KEY);

      const restoredCart = mergeCarts(
        savedUserCart,
        guestCart
      );

      userIdRef.current = nextUserId;

      localStorage.setItem(
        getUserCartKey(nextUserId),
        JSON.stringify(restoredCart)
      );

      localStorage.removeItem(GUEST_KEY);

      commitCart(restoredCart, nextUserId);
    } catch (error) {
      console.error("Cart authentication sync failed:", error);
    } finally {
      if (!readyRef.current) {
        readyRef.current = true;
        setReady(true);
      }
    }
  }, [commitCart]);

  const queueAuthenticationSync = useCallback(() => {
    syncQueueRef.current = syncQueueRef.current
      .catch(() => undefined)
      .then(syncAuthentication);
  }, [syncAuthentication]);

  useEffect(() => {
    void queueAuthenticationSync();

    const handleAuthChange = () => {
      void queueAuthenticationSync();
    };

    window.addEventListener(
      "henrys-auth-changed",
      handleAuthChange
    );

    return () => {
      window.removeEventListener(
        "henrys-auth-changed",
        handleAuthChange
      );
    };
  }, [queueAuthenticationSync]);

  const addItem = useCallback(
    (
      item: Omit<CartItem, "quantity">,
      quantity = 1
    ): boolean => {
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

      const current = itemsRef.current;

      const existing = current.find(
        (entry) => entry.id === item.id
      );

      const nextQuantity =
        (existing?.quantity ?? 0) + quantity;

      if (nextQuantity > item.stock) return false;

      const nextItems = existing
        ? current.map((entry) =>
            entry.id === item.id
              ? { ...entry, ...item, quantity: nextQuantity }
              : entry
          )
        : [...current, { ...item, quantity }];

      commitCart(nextItems);

      return true;
    },
    [commitCart]
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (!Number.isInteger(quantity) || quantity < 1) return;

      const nextItems = itemsRef.current.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.min(quantity, item.stock),
            }
          : item
      );

      commitCart(nextItems);
    },
    [commitCart]
  );

  const removeItem = useCallback(
    (id: string) => {
      const nextItems = itemsRef.current.filter(
        (item) => item.id !== id
      );

      commitCart(nextItems);
    },
    [commitCart]
  );

  const clearCart = useCallback(() => {
    commitCart([]);

    // Explicitly clear the current owner's saved bag too.
    if (userIdRef.current) {
      localStorage.removeItem(
        getUserCartKey(userIdRef.current)
      );
    } else {
      localStorage.removeItem(GUEST_KEY);
    }
  }, [commitCart]);

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
