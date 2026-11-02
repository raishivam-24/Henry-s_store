
"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
} from "lucide-react";

import { useCart } from "@/context/CartContext";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const formatPrice = (price: number) =>
  `₹${price.toLocaleString("en-IN")}`;

export default function CartDrawer({
  open,
  onClose,
}: CartDrawerProps) {
  const {
    items,
    ready,
    updateQuantity,
    removeItem,
    subtotal,
    totalItems,
  } = useCart();

  // Lock background scrolling and close drawer with Escape.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Dark background overlay */}
      <button
        type="button"
        aria-label="Close shopping cart"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-black/45 backdrop-blur-[1px]"
      />

      {/* Right-side drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="absolute right-0 top-0 flex h-full w-full max-w-[460px] flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300"
      >
        {/* Drawer header */}
        <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-[#edf0e9] px-5">
          <div className="flex items-center gap-3">
            <ShoppingBag size={21} className="text-[#263c30]" />

            <h2 className="text-lg font-semibold text-[#263c30]">
              My Cart
              <span className="ml-1.5 text-sm font-normal text-[#899389]">
                ({totalItems}{" "}
                {totalItems === 1 ? "Product" : "Products"})
              </span>
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#39463c] transition hover:bg-[#f0f5ed]"
          >
            <X size={21} />
          </button>
        </div>

        {/* Loading state */}
        {!ready ? (
          <div className="flex flex-1 items-center justify-center text-sm text-[#899389]">
            Loading your cart...
          </div>
        ) : items.length === 0 ? (
          /* Empty cart */
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#f0f5ed]">
              <ShoppingBag size={34} className="text-[#287d6c]" />
            </div>

            <h3 className="text-xl font-semibold text-[#263c30]">
              Your cart is empty
            </h3>

            <p className="mt-2 max-w-[260px] text-sm leading-6 text-[#899389]">
              Looks like you haven&apos;t added anything to your cart yet.
            </p>

            <Link
              href="/products"
              onClick={onClose}
              className="mt-6 flex items-center gap-2 rounded-full bg-[#287d6c] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#205f53]"
            >
              Explore Products
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            {/* Cart items area */}
            <div className="flex-1 overflow-y-auto">
              <div className="border-b border-[#edf0e9] px-5 py-4">
                <p className="text-sm font-medium text-[#455347]">
                  You have {totalItems}{" "}
                  {totalItems === 1 ? "item" : "items"} in your cart
                </p>
              </div>

              <div className="space-y-3 px-4 py-4">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="relative flex gap-3 rounded-2xl border border-[#edf0e9] bg-white p-3"
                  >
                    {/* Product image */}
                    <div className="relative h-[100px] w-[100px] shrink-0 overflow-hidden rounded-xl bg-[#f5f6f1]">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="100px"
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-gray-400">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Product details */}
                    <div className="flex min-w-0 flex-1 flex-col py-1">
                      <h3 className="pr-7 text-sm font-semibold leading-5 text-[#303a31]">
                        {item.name}
                      </h3>

                      <p className="mt-1 text-xs text-[#899389]">
                        {item.category || "Skincare"}
                      </p>

                      <p className="mt-2 text-base font-bold text-[#263c30]">
                        {formatPrice(item.price)}
                      </p>

                      {/* Quantity controls and line total */}
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex h-8 items-center overflow-hidden rounded-lg border border-[#e4e9e0]">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="flex h-full w-8 items-center justify-center text-[#455347] transition hover:bg-[#f0f5ed] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Minus size={13} />
                          </button>

                          <span className="min-w-7 text-center text-xs font-semibold text-[#303a31]">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.stock}
                            aria-label={`Increase quantity of ${item.name}`}
                            className="flex h-full w-8 items-center justify-center text-[#455347] transition hover:bg-[#f0f5ed] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <span className="text-sm font-semibold text-[#263c30]">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>

                    {/* Remove item */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.name} from cart`}
                      className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-[#9a9f98] transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </article>
                ))}
              </div>

              {/* Continue shopping */}
              <div className="px-5 pb-5">
                <Link
                  href="/products"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#287d6c] hover:underline"
                >
                  Continue Shopping
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Fixed bottom summary */}
            <div className="shrink-0 border-t border-[#e8ece4] bg-white px-5 pb-5 pt-4 shadow-[0_-8px_25px_rgba(30,50,35,0.05)]">
              <div className="mb-3 flex items-center justify-between text-sm text-[#596459]">
                <span>Subtotal ({totalItems} items)</span>

                <span className="font-semibold text-[#303a31]">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="mb-4 flex items-center justify-between border-t border-[#edf0e9] pt-4">
                <span className="text-base font-semibold text-[#263c30]">
                  Estimated Total
                </span>

                <span className="text-xl font-bold text-[#263c30]">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <p className="mb-4 text-xs leading-5 text-[#899389]">
                Shipping and applicable charges will be calculated at checkout.
              </p>

              <Link
                href="/checkout"
                onClick={onClose}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#287d6c] px-5 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#205f53]"
              >
                Proceed to Checkout
                <ArrowRight size={17} />
              </Link>

              <p className="mt-3 text-center text-[11px] text-[#899389]">
                Thank you for shopping with Henry&apos;s Skincare.
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
