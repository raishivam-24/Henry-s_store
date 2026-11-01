
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Star, ShoppingBag, Check, Bell } from "lucide-react";
import { useState } from "react";
import { useCart, type CartItem } from "@/context/CartContext";
import type { Product } from "@/lib/products";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  const { addItem } = useCart();

  const price = product.price;
  const originalPrice = product.originalPrice;
  const stock = product.stock;

  const hasPrice =
    typeof price === "number" &&
    Number.isFinite(price) &&
    price > 0;

  const inStock =
    typeof stock === "number" &&
    Number.isInteger(stock) &&
    stock > 0;

  const canPurchase = hasPrice && inStock;

  const discount =
    hasPrice &&
    typeof originalPrice === "number" &&
    Number.isFinite(originalPrice) &&
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  const productUrl = `/products/${product.id}`;

  const saveGuestCartItem = (item: Omit<CartItem, "quantity">) => {
    const GUEST_CART_KEY = "henrys-store-guest-cart";

    try {
      const storedCart = localStorage.getItem(GUEST_CART_KEY);
      const guestCart: CartItem[] = storedCart
        ? JSON.parse(storedCart)
        : [];

      const existingItem = guestCart.find(
        (cartItem) => cartItem.id === item.id
      );

      if (existingItem) {
        existingItem.quantity = Math.min(
          existingItem.quantity + 1,
          item.stock
        );
        existingItem.stock = item.stock;
      } else {
        guestCart.push({
          ...item,
          quantity: 1,
        });
      }

      localStorage.setItem(
        GUEST_CART_KEY,
        JSON.stringify(guestCart)
      );

      return true;
    } catch (error) {
      console.error("Could not save guest cart:", error);
      return false;
    }
  };

  const handleAddToBag = async () => {
    if (!canPurchase || typeof stock !== "number" || !hasPrice || adding) {
      return;
    }

    setAdding(true);
    setAdded(false);

    const item: Omit<CartItem, "quantity"> = {
      id: String(product.id),
      name: product.name,
      image: product.image,
      price,
      stock,
      category: product.category,
    };

    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 401) {
        const saved = saveGuestCartItem(item);

        if (!saved) {
          setAdding(false);
          return;
        }

        const returnUrl =
          window.location.pathname + window.location.search;

        router.push(
          `/login?redirectTo=${encodeURIComponent(returnUrl)}`
        );

        return;
      }

      if (!response.ok) {
        throw new Error("Unable to verify your login status.");
      }

      const result = await response.json();

      if (!result.user) {
        throw new Error("User session could not be verified.");
      }

      const success = addItem(item, 1);
      setAdded(success);
    } catch (error) {
      console.error("Add to bag failed:", error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="group min-w-0">
      <div className="relative">
        <Link
          href={productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#efeee8]">
            {product.badge && (
              <span className="absolute left-3 top-3 z-10 rounded-full bg-[#1d392d] px-3 py-1.5 text-[9px] font-semibold tracking-wider text-white">
                {product.badge}
              </span>
            )}

            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-5 transition-transform duration-500 group-hover:scale-105 sm:p-7"
            />
          </div>
        </Link>

        <button
          type="button"
          aria-label={
            wishlisted ? "Remove from wishlist" : "Add to wishlist"
          }
          aria-pressed={wishlisted}
          onClick={() => setWishlisted((current) => !current)}
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition hover:bg-gray-100"
        >
          <Heart
            size={17}
            strokeWidth={1.7}
            fill={wishlisted ? "currentColor" : "none"}
            className={wishlisted ? "text-red-600" : ""}
          />
        </button>

        <div className="absolute bottom-3 left-3 right-3 z-20">
          {canPurchase ? (
            <button
              type="button"
              onClick={handleAddToBag}
              disabled={adding}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-2 py-3 text-xs font-medium shadow-lg transition hover:bg-[#1d392d] hover:text-white disabled:cursor-wait disabled:opacity-70 sm:text-sm"
            >
              {added ? (
                <Check size={16} />
              ) : (
                <ShoppingBag size={16} />
              )}

              {adding
                ? "Please wait..."
                : added
                  ? "Added to bag"
                  : "Add to bag"}
            </button>
          ) : hasPrice ? (
            <button
              type="button"
              disabled
              title="Stock confirmation pending"
              className="flex min-h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-white/95 px-2 py-3 text-xs font-medium text-gray-600 shadow-lg sm:text-sm"
            >
              <Bell size={15} />
              Notify when available
            </button>
          ) : (
            <button
              type="button"
              disabled
              title="Price confirmation pending"
              className="flex min-h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-white/95 px-2 py-3 text-xs font-medium text-gray-600 shadow-lg sm:text-sm"
            >
              <ShoppingBag size={15} />
              Price unavailable
            </button>
          )}
        </div>
      </div>

      <div className="pt-4">
        <div className="flex items-center gap-1">
          <Star
            size={13}
            fill="currentColor"
            strokeWidth={1.5}
          />
          <span className="text-xs">{product.rating}</span>
          <span className="text-xs text-gray-400">
            ({product.reviews})
          </span>
        </div>

        <Link
          href={productUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h3 className="mt-2 line-clamp-2 text-sm font-medium leading-5 transition hover:opacity-60">
            {product.name}
          </h3>
        </Link>

        <p className="mt-1 text-xs text-gray-500">
          {product.category}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">
            {hasPrice
              ? `₹${price.toLocaleString("en-IN")}`
              : "Price unavailable"}
          </span>

          {hasPrice &&
            typeof originalPrice === "number" &&
            Number.isFinite(originalPrice) &&
            originalPrice > price && (
              <span className="text-xs text-gray-400 line-through">
                ₹{originalPrice.toLocaleString("en-IN")}
              </span>
            )}

          {discount !== null && (
            <span className="text-[10px] font-medium text-green-700">
              {discount}% OFF
            </span>
          )}
        </div>

        {hasPrice && !inStock && (
          <p className="mt-2 text-xs text-gray-500">
            Stock confirmation pending
          </p>
        )}
      </div>
    </article>
  );
}
