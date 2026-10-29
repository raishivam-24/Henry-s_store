
"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const {
    items,
    ready,
    updateQuantity,
    removeItem,
    subtotal,
    totalItems,
  } = useCart();

  if (!ready) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16">
        <p>Loading your cart...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="rounded-xl border p-8 text-center">
          <p className="mb-4 text-lg">Your cart is empty.</p>
          <Link
            href="/products"
            className="inline-block rounded-lg bg-black px-6 py-3 text-white"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <section className="space-y-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="96px"
                    className="object-contain"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold">{item.name}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {item.category}
                  </p>
                  <p className="mt-2 font-medium">
                    ₹{item.price.toLocaleString("en-IN")}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Available stock: {item.stock}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.id, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
                    aria-label={`Decrease quantity of ${item.name}`}
                    className="h-9 w-9 rounded border disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    −
                  </button>

                  <span className="min-w-6 text-center">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.id, item.quantity + 1)
                    }
                    disabled={item.quantity >= item.stock}
                    aria-label={`Increase quantity of ${item.name}`}
                    className="h-9 w-9 rounded border disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <div className="sm:text-right">
                  <p className="font-semibold">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="mt-2 text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </section>

          <aside className="h-fit rounded-xl border p-6">
            <h2 className="mb-5 text-xl font-semibold">Order Summary</h2>

            <div className="flex justify-between py-2">
              <span>Total items</span>
              <span>{totalItems}</span>
            </div>

            <div className="flex justify-between border-t py-4 font-semibold">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>

            <p className="mb-4 text-sm text-gray-500">
              Shipping and any applicable taxes will be calculated at checkout.
            </p>

            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed rounded-lg bg-gray-300 px-5 py-3 font-medium text-gray-600"
            >
              Checkout coming soon
            </button>

            <Link
              href="/products"
              className="mt-4 block text-center text-sm underline"
            >
              Continue Shopping
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
