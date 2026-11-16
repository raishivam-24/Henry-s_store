
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  Package,
  ShoppingBag,
  ArrowRight,
  Loader2,
  MapPin,
} from "lucide-react";

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  image?: string;
};

type Order = {
  _id: string;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
  };
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
};

const formatPrice = (price: number) =>
  `₹${price.toLocaleString("en-IN")}`;

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();

  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;

    async function fetchOrder() {
      try {
        const response = await fetch(
          `/api/orders/${encodeURIComponent(orderId)}`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Could not load order details.");
        }

        if (!cancelled) {
          setOrder(data.order);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your order."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafbf8] px-4">
        <div className="text-center">
          <Loader2
            size={36}
            className="mx-auto mb-4 animate-spin text-[#287d6c]"
          />
          <p className="text-sm text-[#596459]">
            Loading your order...
          </p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafbf8] px-4">
        <div className="max-w-md rounded-2xl border border-[#e8ece4] bg-white p-8 text-center shadow-sm">
          <Package
            size={42}
            className="mx-auto mb-4 text-[#287d6c]"
          />

          <h1 className="text-xl font-bold text-[#263c30]">
            Order details unavailable
          </h1>

          <p className="mt-3 text-sm text-[#899389]">
            {error || "We could not find this order."}
          </p>

          <Link
            href="/account"
            className="mt-6 inline-flex rounded-xl bg-[#287d6c] px-6 py-3 text-sm font-semibold text-white hover:bg-[#205f53]"
          >
            Go to My Account
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafbf8] px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-2xl border border-[#e8ece4] bg-white p-6 text-center shadow-sm sm:p-10">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#edf7ef]">
            <CheckCircle2
              size={48}
              className="text-[#287d6c]"
            />
          </div>

          <p className="text-sm font-semibold uppercase tracking-wider text-[#287d6c]">
            Order Confirmation
          </p>

          <h1 className="mt-3 text-3xl font-bold text-[#263c30]">
            Thank you for your order!
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#899389]">
            Your order has been placed successfully. We will process
            it shortly.
          </p>

          <div className="mt-7 rounded-xl bg-[#f5f8f2] p-4">
            <p className="text-xs text-[#899389]">
              Order ID
            </p>

            <p className="mt-1 break-all text-sm font-semibold text-[#263c30]">
              {order._id}
            </p>
          </div>

          <div className="mt-6 grid gap-4 text-left sm:grid-cols-2">
            <div className="rounded-xl border border-[#e8ece4] p-4">
              <div className="flex items-center gap-2 text-[#287d6c]">
                <Package size={18} />
                <span className="text-sm font-semibold text-[#263c30]">
                  Order Status
                </span>
              </div>

              <p className="mt-2 text-sm text-[#596459]">
                {order.orderStatus}
              </p>
            </div>

            <div className="rounded-xl border border-[#e8ece4] p-4">
              <div className="flex items-center gap-2 text-[#287d6c]">
                <ShoppingBag size={18} />
                <span className="text-sm font-semibold text-[#263c30]">
                  Payment Method
                </span>
              </div>

              <p className="mt-2 text-sm text-[#596459]">
                {order.paymentMethod === "COD"
                  ? "Cash on Delivery"
                  : order.paymentMethod}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-[#e8ece4] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#263c30]">
            Order Items
          </h2>

          <div className="mt-5 space-y-4">
            {order.items.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="flex items-center justify-between gap-4 border-b border-[#edf0e9] pb-4 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#263c30]">
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

          <div className="mt-5 space-y-3 border-t border-[#edf0e9] pt-5 text-sm">
            <div className="flex justify-between text-[#596459]">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>

            <div className="flex justify-between text-[#596459]">
              <span>Shipping</span>
              <span>{formatPrice(order.shippingFee)}</span>
            </div>

            <div className="flex justify-between pt-2 text-base font-bold text-[#263c30]">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-[#e8ece4] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <MapPin size={19} className="text-[#287d6c]" />
            <h2 className="text-lg font-semibold text-[#263c30]">
              Delivery Address
            </h2>
          </div>

          <div className="mt-4 text-sm leading-6 text-[#596459]">
            <p className="font-semibold text-[#263c30]">
              {order.shippingAddress.name}
            </p>

            <p>{order.shippingAddress.addressLine}</p>

            <p>
              {order.shippingAddress.city},{" "}
              {order.shippingAddress.state} -{" "}
              {order.shippingAddress.pincode}
            </p>

            <p>Phone: {order.shippingAddress.phone}</p>
          </div>
        </section>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#287d6c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#205f53]"
          >
            Continue Shopping
            <ArrowRight size={16} />
          </Link>

          <Link
            href="/account"
            className="inline-flex items-center justify-center rounded-xl border border-[#dce5da] bg-white px-6 py-3 text-sm font-semibold text-[#287d6c] transition hover:bg-[#f5f8f2]"
          >
            My Account
          </Link>
        </div>
      </div>
    </main>
  );
}
