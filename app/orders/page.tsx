
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Package,
  ShoppingBag,
  CalendarDays,
  IndianRupee,
  RefreshCw,
} from "lucide-react";

type OrderItem = {
  product?: string;
  name: string;
  image?: string;
  quantity: number;
  price: number;
};

type Order = {
  _id: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: "COD" | "ONLINE";
  paymentStatus: string;
  orderStatus:
    | "PLACED"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  createdAt: string;
  updatedAt?: string;
};

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatDate = (date: string) => {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case "DELIVERED":
      return "bg-green-100 text-green-700";
    case "SHIPPED":
      return "bg-blue-100 text-blue-700";
    case "PROCESSING":
      return "bg-purple-100 text-purple-700";
    case "CONFIRMED":
      return "bg-teal-100 text-teal-700";
    case "CANCELLED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/orders", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load your orders.");
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <main className="min-h-screen bg-[#fafbf9] px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/account"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-green-700"
          >
            <ArrowLeft size={16} />
            Back to My Account
          </Link>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
                Your Account
              </p>
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                My Orders
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                View your purchases and track your orders.
              </p>
            </div>

            <button
              onClick={fetchOrders}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-green-600 hover:text-green-700 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-gray-100 bg-white px-6 py-20 text-center shadow-sm">
            <RefreshCw
              size={30}
              className="mx-auto animate-spin text-green-700"
            />
            <p className="mt-4 font-medium text-gray-700">
              Loading your orders...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-100 bg-white px-6 py-16 text-center shadow-sm">
            <p className="font-semibold text-red-600">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-5 rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty Orders */}
        {!loading && !error && orders.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
              <ShoppingBag size={34} className="text-green-700" />
            </div>

            <h2 className="mt-6 text-xl font-bold text-gray-900">
              No orders yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              You haven't placed any orders yet. Explore our products and
              find something you'll love.
            </p>

            <Link
              href="/products"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-green-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              Explore Products
              <ArrowRight size={17} />
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {orders.length}
                </span>{" "}
                {orders.length === 1 ? "order" : "orders"}
              </p>
            </div>

            {orders.map((order) => (
              <div
                key={order._id}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-5 py-5 sm:px-7">
                  <div className="flex flex-wrap gap-6">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Order ID
                      </p>
                      <p className="mt-1 text-sm font-bold text-gray-900">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Order Date
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                        <CalendarDays size={14} />
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${getStatusStyle(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                </div>

                {/* Order Items */}
                <div className="space-y-4 px-5 py-5 sm:px-7">
                  {order.items?.map((item, index) => (
                    <div
                      key={`${order._id}-${index}`}
                      className="flex items-center gap-4"
                    >
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package
                            size={25}
                            className="text-gray-400"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-gray-900">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>

                      <p className="shrink-0 text-sm font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/70 px-5 py-5 sm:px-7">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">
                      Payment:{" "}
                      <span className="font-semibold text-gray-700">
                        {order.paymentMethod === "COD"
                          ? "Cash on Delivery"
                          : "Online"}
                      </span>
                    </p>

                    <p className="text-xs text-gray-500">
                      Payment Status:{" "}
                      <span className="font-semibold text-gray-700">
                        {order.paymentStatus}
                      </span>
                    </p>

                    <p className="flex items-center gap-1 text-lg font-bold text-gray-900">
                      <IndianRupee size={17} />
                      {Number(order.total || 0).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <Link
                    href={`/orders/${order._id}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
                  >
                    View Details
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

