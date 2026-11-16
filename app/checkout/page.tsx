
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, ShoppingBag, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";

type ShippingAddress = {
  name: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
};

const initialAddress: ShippingAddress = {
  name: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
};

const formatPrice = (price: number) =>
  `₹${price.toLocaleString("en-IN")}`;

export default function CheckoutPage() {
  const router = useRouter();

  const {
    items,
    ready,
    subtotal,
    totalItems,
    clearCart,
  } = useCart();

  const [address, setAddress] =
    useState<ShippingAddress>(initialAddress);

  const [paymentMethod, setPaymentMethod] = useState<"COD">("COD");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const shippingFee = 0;
  const total = subtotal + shippingFee;

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;

    setAddress((previous) => ({
      ...previous,
      [name]:
        name === "pincode" || name === "phone"
          ? value.replace(/\D/g, "")
          : value,
    }));
  }

  async function handlePlaceOrder(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (submitting) return;

    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    const cleanedAddress: ShippingAddress = {
      name: address.name.trim(),
      phone: address.phone.trim(),
      addressLine: address.addressLine.trim(),
      city: address.city.trim(),
      state: address.state.trim(),
      pincode: address.pincode.trim(),
    };

    if (
      !cleanedAddress.name ||
      !cleanedAddress.addressLine ||
      !cleanedAddress.city ||
      !cleanedAddress.state
    ) {
      setError("Please complete all shipping address fields.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanedAddress.phone)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(cleanedAddress.pincode)) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
          shippingAddress: cleanedAddress,
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to place your order. Please try again."
        );
      }

      const orderId =
        data.order?._id ||
        data.order?.id ||
        data.orderId ||
        data.id;

      if (!orderId) {
        throw new Error(
          "Order was created, but the confirmation ID was not returned. Please check My Orders before trying again."
        );
      }

      clearCart();

      router.replace(
        `/order-success/${encodeURIComponent(String(orderId))}`
      );
    } catch (err) {
      console.error("Place order error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while placing your order."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-20">
        <p className="text-center text-[#596459]">
          Loading checkout...
        </p>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-20 text-center">
        <ShoppingBag
          size={48}
          className="mx-auto mb-4 text-[#287d6c]"
        />

        <h1 className="text-2xl font-bold text-[#263c30]">
          Your cart is empty
        </h1>

        <p className="mt-2 text-sm text-[#899389]">
          Add products before proceeding to checkout.
        </p>

        <Link
          href="/products"
          className="mt-6 inline-flex rounded-xl bg-[#287d6c] px-6 py-3 text-sm font-semibold text-white hover:bg-[#205f53]"
        >
          Explore Products
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafbf8] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/products"
            className="mb-4 inline-flex items-center gap-2 text-sm text-[#287d6c] hover:underline"
          >
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>

          <h1 className="text-3xl font-bold tracking-tight text-[#263c30]">
            Checkout
          </h1>

          <p className="mt-2 text-sm text-[#899389]">
            Complete your shipping details to place your order.
          </p>
        </div>

        <form
          onSubmit={handlePlaceOrder}
          className="grid items-start gap-8 lg:grid-cols-[1fr_380px]"
        >
          {/* Left section */}
          <div className="space-y-6">
            {/* Shipping address */}
            <section className="rounded-2xl border border-[#e8ece4] bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0f5ed]">
                  <MapPin size={20} className="text-[#287d6c]" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-[#263c30]">
                    Shipping Address
                  </h2>

                  <p className="text-xs text-[#899389]">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {/* Full name */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-[#455347]"
                  >
                    Full Name *
                  </label>

                  <input
                    id="name"
                    name="name"
                    value={address.name}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-[#e0e5dc] bg-[#fafbf8] px-4 py-3 text-sm text-[#263c30] outline-none transition focus:border-[#398d7d] focus:ring-4 focus:ring-[#398d7d]/10"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-[#455347]"
                  >
                    Phone Number *
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    value={address.phone}
                    onChange={handleChange}
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    className="w-full rounded-xl border border-[#e0e5dc] bg-[#fafbf8] px-4 py-3 text-sm text-[#263c30] outline-none transition focus:border-[#398d7d] focus:ring-4 focus:ring-[#398d7d]/10"
                  />
                </div>

                {/* Pincode */}
                <div>
                  <label
                    htmlFor="pincode"
                    className="mb-2 block text-sm font-medium text-[#455347]"
                  >
                    Pincode *
                  </label>

                  <input
                    id="pincode"
                    name="pincode"
                    inputMode="numeric"
                    value={address.pincode}
                    onChange={handleChange}
                    required
                    maxLength={6}
                    placeholder="6-digit pincode"
                    className="w-full rounded-xl border border-[#e0e5dc] bg-[#fafbf8] px-4 py-3 text-sm text-[#263c30] outline-none transition focus:border-[#398d7d] focus:ring-4 focus:ring-[#398d7d]/10"
                  />
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="addressLine"
                    className="mb-2 block text-sm font-medium text-[#455347]"
                  >
                    Complete Address *
                  </label>

                  <textarea
                    id="addressLine"
                    name="addressLine"
                    value={address.addressLine}
                    onChange={handleChange}
                    required
                    maxLength={300}
                    rows={3}
                    placeholder="House number, street, landmark..."
                    className="w-full resize-none rounded-xl border border-[#e0e5dc] bg-[#fafbf8] px-4 py-3 text-sm text-[#263c30] outline-none transition focus:border-[#398d7d] focus:ring-4 focus:ring-[#398d7d]/10"
                  />
                </div>

                {/* City */}
                <div>
                  <label
                    htmlFor="city"
                    className="mb-2 block text-sm font-medium text-[#455347]"
                  >
                    City *
                  </label>

                  <input
                    id="city"
                    name="city"
                    value={address.city}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    placeholder="Enter city"
                    className="w-full rounded-xl border border-[#e0e5dc] bg-[#fafbf8] px-4 py-3 text-sm text-[#263c30] outline-none transition focus:border-[#398d7d] focus:ring-4 focus:ring-[#398d7d]/10"
                  />
                </div>

                {/* State */}
                <div>
                  <label
                    htmlFor="state"
                    className="mb-2 block text-sm font-medium text-[#455347]"
                  >
                    State *
                  </label>

                  <input
                    id="state"
                    name="state"
                    value={address.state}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    placeholder="Enter state"
                    className="w-full rounded-xl border border-[#e0e5dc] bg-[#fafbf8] px-4 py-3 text-sm text-[#263c30] outline-none transition focus:border-[#398d7d] focus:ring-4 focus:ring-[#398d7d]/10"
                  />
                </div>
              </div>
            </section>

            {/* Payment method */}
            <section className="rounded-2xl border border-[#e8ece4] bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0f5ed]">
                  <Truck size={20} className="text-[#287d6c]" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-[#263c30]">
                    Payment Method
                  </h2>

                  <p className="text-xs text-[#899389]">
                    Select your preferred payment option.
                  </p>
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-[#287d6c] bg-[#f3f8f2] p-4">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="h-4 w-4 accent-[#287d6c]"
                />

                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#263c30]">
                    Cash on Delivery
                  </p>

                  <p className="mt-1 text-xs text-[#899389]">
                    Pay when your order arrives.
                  </p>
                </div>

                <span className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#287d6c]">
                  COD
                </span>
              </label>
            </section>
          </div>

          {/* Right section - Order summary */}
          <aside className="h-fit rounded-2xl border border-[#e8ece4] bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24">
            <h2 className="mb-5 text-lg font-semibold text-[#263c30]">
              Order Summary
            </h2>

            <div className="mb-5 flex items-center justify-between text-sm text-[#899389]">
              <span>Your Products</span>
              <span>{totalItems} items</span>
            </div>

            <div className="max-h-[340px] space-y-4 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f5f6f1]">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-[#303a31]">
                      {item.name}
                    </p>

                    <p className="mt-1 text-xs text-[#899389]">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-semibold text-[#263c30]">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="my-5 border-t border-[#edf0e9]" />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-[#596459]">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between text-[#596459]">
                <span>Shipping</span>
                <span>
                  {shippingFee === 0 ? "₹0" : formatPrice(shippingFee)}
                </span>
              </div>
            </div>

            <div className="my-5 border-t border-[#edf0e9]" />

            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#263c30]">
                Total Amount
              </span>

              <span className="text-xl font-bold text-[#263c30]">
                {formatPrice(total)}
              </span>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-xl bg-red-50 p-3 text-xs leading-5 text-red-600"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#287d6c] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#205f53] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Processing..." : "Place Order"}
            </button>

            <p className="mt-4 text-center text-[11px] leading-5 text-[#899389]">
              Your order details will be securely processed.
            </p>
          </aside>
        </form>
      </div>
    </main>
  );
}
