
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  CreditCard,
  ShoppingBag,
  RefreshCw,
  XCircle,
} from "lucide-react";

type OrderItem = {
  product?: string;
  name: string;
  image?: string;
  quantity: number;
  price: number;
};

type ShippingAddress = {
  name: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
};

type Order = {
  _id: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: "COD" | "ONLINE";
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  updatedAt?: string;
};

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatDate = (date?: string) => {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const trackingSteps = [
  {
    status: "PLACED",
    title: "Order Placed",
    description: "Your order has been successfully placed.",
    icon: ShoppingBag,
  },
  {
    status: "CONFIRMED",
    title: "Order Confirmed",
    description: "Your order has been confirmed.",
    icon: CheckCircle2,
  },
  {
    status: "PROCESSING",
    title: "Processing",
    description: "Your order is being prepared.",
    icon: Package,
  },
  {
    status: "SHIPPED",
    title: "Shipped",
    description: "Your order is on its way.",
    icon: Truck,
  },
  {
    status: "DELIVERED",
    title: "Delivered",
    description: "Your order has been delivered.",
    icon: CheckCircle2,
  },
];

const getStatusIndex = (status: string) =>
  trackingSteps.findIndex((step) => step.status === status);

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/orders/${orderId}`, {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load order details.");
      }

      setOrder(data.order);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading your order."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  const isCancelled = order?.orderStatus === "CANCELLED";
  const currentStep = order ? getStatusIndex(order.orderStatus) : -1;

const handleCancelOrder = async () => {
  if (!order) return;

  const confirmed = window.confirm(
    "Are you sure you want to cancel this order? This action cannot be undone."
  );

  if (!confirmed) return;

  try {
    setCancelling(true);
    setError("");
    setCancelMessage("");

    const response = await fetch(
      `/api/orders/${order._id}/cancel`,
      {
        method: "PATCH",
        credentials: "include",
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Unable to cancel order.");
    }

    setOrder((previous) =>
      previous
        ? { ...previous, orderStatus: "CANCELLED" }
        : previous
    );

    setCancelMessage("Your order has been cancelled successfully.");
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Something went wrong."
    );
  } finally {
    setCancelling(false);
  }
};

  return (
    <main className="min-h-screen bg-[#fafbf9] px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">

        {/* Back Navigation */}
        <Link
          href="/orders"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-green-700"
        >
          <ArrowLeft size={16} />
          Back to My Orders
        </Link>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-gray-100 bg-white px-6 py-20 text-center shadow-sm">
            <RefreshCw
              size={32}
              className="mx-auto animate-spin text-green-700"
            />
            <p className="mt-4 text-sm font-medium text-gray-600">
              Loading order details...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-100 bg-white px-6 py-16 text-center shadow-sm">
            <XCircle size={38} className="mx-auto text-red-500" />
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Unable to load order
            </h2>
            <p className="mt-2 text-sm text-gray-500">{error}</p>

            <button
              onClick={fetchOrder}
              className="mt-6 rounded-lg bg-green-700 px-6 py-3 text-sm font-semibold text-white hover:bg-green-800"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && order && (
          <>
            {/* Page Header */}
            <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
                  Order Details
                </p>

                <h1 className="mt-2 text-3xl font-bold text-gray-900">
                  Track Your Order
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                  Order #{order._id.slice(-8).toUpperCase()}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>

              <button
                onClick={fetchOrder}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-green-600 hover:text-green-700"
              >
                <RefreshCw size={16} />
                Refresh Status
              </button>
            </div>

            {/* Cancelled Notice */}
            {isCancelled && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-5">
                <XCircle className="shrink-0 text-red-600" size={25} />
                <div>
                  <h3 className="font-bold text-red-700">
                    Order Cancelled
                  </h3>
                  <p className="mt-1 text-sm text-red-600">
                    This order has been cancelled.
                  </p>
                </div>
              </div>
            )}

            {/* Tracking Progress */}
            {!isCancelled && (
              <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
                <h2 className="text-xl font-bold text-gray-900">
                  Order Tracking
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Current status: {order.orderStatus}
                </p>

                <div className="mt-8 space-y-7">
                  {trackingSteps.map((step, index) => {
                    const completed = index <= currentStep;
                    const active = index === currentStep;
                    const StepIcon = step.icon;

                    return (
                      <div key={step.status} className="relative flex gap-4">
                        {index !== trackingSteps.length - 1 && (
                          <div
                            className={`absolute left-[17px] top-10 h-[calc(100%+12px)] w-0.5 ${
                              index < currentStep
                                ? "bg-green-600"
                                : "bg-gray-200"
                            }`}
                          />
                        )}

                        <div
                          className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                            completed
                              ? "bg-green-700 text-white"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          <StepIcon size={18} />
                        </div>

                        <div className="flex-1 pb-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3
                              className={`text-sm font-bold ${
                                completed
                                  ? "text-gray-900"
                                  : "text-gray-400"
                              }`}
                            >
                              {step.title}
                            </h3>

                            {active && (
                              <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold text-green-700">
                                CURRENT STATUS
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm text-gray-500">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

{/* Cancellation Section */}
{!isCancelled &&
  ["PLACED", "CONFIRMED", "PROCESSING"].includes(
    order.orderStatus
  ) && (
    <section className="mb-6 rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
      <h3 className="font-bold text-gray-900">
        Cancel this order?
      </h3>

      <p className="mt-2 text-sm text-gray-500">
        You can cancel this order before it is shipped.
      </p>

      <button
        type="button"
        onClick={handleCancelOrder}
        disabled={cancelling}
        className="mt-4 rounded-lg border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {cancelling ? "Cancelling..." : "Cancel Order"}
      </button>
    </section>
  )}

{cancelMessage && (
  <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
    {cancelMessage}
  </div>
)}


            {/* Main Content */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

              {/* Products */}
              <section className="space-y-6 lg:col-span-2">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                  <h2 className="mb-6 text-lg font-bold text-gray-900">
                    Ordered Products
                  </h2>

                  <div className="space-y-5">
                    {order.items?.map((item, index) => (
                      <div
                        key={`${order._id}-${index}`}
                        className="flex items-center gap-4"
                      >
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package
                              size={28}
                              className="text-gray-400"
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {item.name}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Quantity: {item.quantity}
                          </p>
                          <p className="mt-1 text-sm font-medium text-green-700">
                            {formatPrice(item.price)} each
                          </p>
                        </div>

                        <p className="shrink-0 text-sm font-bold text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                  <div className="mb-5 flex items-center gap-2">
                    <MapPin size={20} className="text-green-700" />
                    <h2 className="text-lg font-bold text-gray-900">
                      Delivery Address
                    </h2>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-5">
                    <p className="font-bold text-gray-900">
                      {order.shippingAddress?.name}
                    </p>

                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {order.shippingAddress?.addressLine}
                      <br />
                      {order.shippingAddress?.city},{" "}
                      {order.shippingAddress?.state} -{" "}
                      {order.shippingAddress?.pincode}
                    </p>

                    <p className="mt-3 text-sm text-gray-600">
                      Phone: {order.shippingAddress?.phone}
                    </p>
                  </div>
                </div>
              </section>

              {/* Payment Summary */}
              <aside className="space-y-6">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                  <div className="mb-5 flex items-center gap-2">
                    <CreditCard size={20} className="text-green-700" />
                    <h2 className="text-lg font-bold text-gray-900">
                      Payment Details
                    </h2>
                  </div>

                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(order.subtotal)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">Shipping</span>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(order.shippingFee)}
                      </span>
                    </div>

                    <div className="border-t border-dashed border-gray-200 pt-4">
                      <div className="flex justify-between gap-3">
                        <span className="font-bold text-gray-900">
                          Total Amount
                        </span>
                        <span className="text-lg font-bold text-green-700">
                          {formatPrice(order.total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">
                      Payment Method
                    </p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {order.paymentMethod === "COD"
                        ? "Cash on Delivery"
                        : "Online Payment"}
                    </p>

                    <p className="mt-4 text-xs text-gray-500">
                      Payment Status
                    </p>
                    <span className="mt-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-green-50 p-5">
                  <div className="flex items-center gap-2">
                    <Clock size={20} className="text-green-700" />
                    <h3 className="font-bold text-green-900">
                      Need Help?
                    </h3>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-green-800">
                    If you have any questions about your order, please
                    contact our support team.
                  </p>
                </div>
              </aside>
            </div>

            {/* Bottom Navigation */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/orders"
                className="rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-green-600 hover:text-green-700"
              >
                All Orders
              </Link>

              <Link
                href="/products"
                className="rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
              >
                Continue Shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
