"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserRound,
  ShoppingBag,
  Heart,
  MapPin,
  Leaf,
  Sparkles,
  LogOut,
  Package,
  RefreshCw,
  ShieldCheck,
  Truck,
  LayoutDashboard,
  Loader2,
  ArrowRight,
  ChevronRight,
  CircleUserRound,
  Wallet,
  ShoppingCart,
  Clock3,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
};

type Order = {
  _id: string;
  orderNumber?: string;
  order_number?: string;
  total: number;
  status: string;
  createdAt?: string;
  created_at?: string;
  items?: {
    productName?: string;
    product_name?: string;
    image?: string;
    quantity?: number;
  }[];
};

export default function AccountPage() {
  const router = useRouter();
  const { totalItems } = useCart();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [savedItems, setSavedItems] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [checking, setChecking] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (!active) return;

        if (!response.ok || !data.success || !data.user) {
          router.replace("/login?redirectTo=%2Faccount");
          return;
        }

        setUser(data.user);

        // Read saved wishlist count if available.
        try {
          const wishlist = localStorage.getItem("henrys-store-wishlist");

          if (wishlist) {
            const parsed: unknown = JSON.parse(wishlist);

            if (Array.isArray(parsed)) {
              setSavedItems(parsed.length);
            }
          }
        } catch {
          setSavedItems(0);
        }

        // Orders will be loaded when the customer orders endpoint is available.
        // Do not display fabricated order records or totals.
      } catch {
        if (active) {
          setError("Unable to load your account. Please refresh.");
        }
      } finally {
        if (active) setChecking(false);
      }
    }

    loadAccount();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Could not log out. Please try again.");
      }

      // CartContext handles saving the current user's cart and clearing
      // the active cart after authentication changes.
      window.dispatchEvent(new Event("henrys-auth-changed"));

      router.replace("/login");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Logout failed."
      );
      setLoggingOut(false);
    }
  }

  if (checking) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-[#f7f8f2]">
        <div className="flex items-center gap-3 text-sm text-[#315b45]">
          <Loader2 size={22} className="animate-spin" />
          Loading your account...
        </div>
      </main>
    );
  }

  
if (!user) {
  return (
    <main className="relative isolate min-h-[650px] overflow-hidden bg-[#f2f5ec] px-4 py-10 sm:px-7 lg:flex lg:items-center lg:justify-center lg:px-10">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-24 h-[420px] w-[420px] rounded-full bg-[#c9dfb7]/60 blur-[90px]" />
        <div className="absolute -right-32 bottom-0 h-[450px] w-[450px] rounded-full bg-[#d9e8ca]/70 blur-[100px]" />
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/50 blur-[100px]" />
      </div>

      <div className="mx-auto w-full max-w-[1120px]">
        {/* Main card */}
        <div className="grid overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_25px_80px_rgba(35,66,43,0.14)] lg:grid-cols-2">

          {/* Left promotional panel */}
          <section className="relative flex min-h-[420px] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#d9e9c9] via-[#c6dcaf] to-[#a7c88d] p-7 sm:p-10 lg:min-h-[560px] lg:p-12">
            <div className="absolute -right-20 top-20 h-72 w-72 rounded-full border border-white/40" />
            <div className="absolute -right-10 top-32 h-52 w-52 rounded-full border border-white/40" />
            <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-[#5c8b4c]/20 blur-2xl" />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/65 px-4 py-2 !text-[11px] !font-bold uppercase tracking-[0.14em] !text-[#244633]">
                <Leaf size={15} />
                Welcome to Henry&apos;s
              </span>

              <h1 className="mt-8 max-w-[390px] !font-serif !text-[38px] !font-bold !leading-[1.12] !tracking-tight !text-[#173b2b] sm:!text-[48px] lg:!text-[52px]">
                Your Skincare Journey Starts Here
              </h1>

              <p className="mt-5 max-w-[340px] !text-[14px] !leading-7 !text-[#31523c]">
                Discover skincare essentials, manage your orders and create a
                routine that feels right for your skin.
              </p>
            </div>

            <div className="relative z-10 mt-10 grid max-w-[370px] grid-cols-3 gap-3">
              {[
                { icon: Package, label: "Track Orders" },
                { icon: Heart, label: "Your Favorites" },
                { icon: Sparkles, label: "Personalized Picks" },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex min-h-[100px] flex-col items-center justify-center gap-3 rounded-2xl border border-white/60 bg-white/45 p-3 text-center backdrop-blur-sm"
                  >
                    <Icon size={25} className="text-[#24583c]" />
                    <span className="!text-[11px] !font-semibold !text-[#173b2b]">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <Leaf
              size={190}
              strokeWidth={0.7}
              className="pointer-events-none absolute -bottom-12 -right-8 rotate-[-35deg] text-white/30"
            />
          </section>

          {/* Right login card */}
          <section className="flex items-center justify-center bg-white px-6 py-12 sm:px-12 lg:px-14">
            <div className="w-full max-w-[390px] text-center">
              <div className="mx-auto flex h-[66px] w-[66px] items-center justify-center rounded-2xl bg-[#e0f5e9] text-[#176b4b]">
                <UserRound size={34} strokeWidth={1.7} />
              </div>

              <p className="mt-5 !text-[10px] !font-bold uppercase tracking-[0.22em] !text-[#398878]">
                Your account
              </p>

              <h2 className="mt-3 !font-serif !text-[30px] !font-bold !leading-[1.2] !tracking-tight !text-[#173b2b] sm:!text-[36px]">
                Sign in to your account
              </h2>

              <p className="mx-auto mt-4 max-w-[330px] !text-[13px] !leading-6 !text-[#718077]">
                Log in to view your orders, manage your profile and save your
                favourite skincare products.
              </p>

              {error && (
                <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 !text-sm !text-red-700">
                  {error}
                </p>
              )}

              <Link
                href="/login"
                className="mt-8 inline-flex h-[54px] w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#176b43] to-[#087b49] !text-[14px] !font-bold !text-white shadow-[0_10px_25px_rgba(15,100,60,0.2)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(15,100,60,0.28)]"
              >
                Login / Sign up
                <ArrowRight size={19} />
              </Link>

              <p className="mt-5 !text-[11px] !text-[#98a49b]">
                Your skincare journey starts here.
              </p>

              <div className="mt-9 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#e9eee9]" />
                <span className="!text-[10px] !font-medium !text-[#99a59c]">
                  HENRY&apos;S SKINCARE
                </span>
                <div className="h-px flex-1 bg-[#e9eee9]" />
              </div>
            </div>
          </section>
        </div>

        {/* Benefits strip */}
        <div className="mt-5 grid grid-cols-2 gap-4 rounded-2xl border border-white/80 bg-white/85 px-5 py-5 shadow-sm sm:grid-cols-4 sm:px-8">
          {[
            {
              icon: Truck,
              title: "Free Shipping",
              subtitle: "Orders above ₹699",
            },
            {
              icon: ShieldCheck,
              title: "100% Authentic",
              subtitle: "Genuine products",
            },
            {
              icon: RefreshCw,
              title: "Easy Returns",
              subtitle: "7-day hassle free returns",
            },
            {
              icon: Leaf,
              title: "Dermatologist Inspired",
              subtitle: "Care you can trust",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="flex items-center gap-3">
                <Icon
                  size={26}
                  strokeWidth={1.7}
                  className="shrink-0 text-[#17643f]"
                />
                <div>
                  <p className="!text-[11px] !font-bold !text-[#263e33] sm:!text-[13px]">
                    {item.title}
                  </p>
                  <p className="mt-1 !text-[10px] !text-[#829087]">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}


  const initials = user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const stats = [
    {
      label: "Total Orders",
      value: orders.length,
      icon: Package,
      color: "text-[#247744]",
    },
    {
      label: "Saved Items",
      value: savedItems,
      icon: Heart,
      color: "text-[#247744]",
    },
    {
      label: "Cart Items",
      value: totalItems,
      icon: ShoppingCart,
      color: "text-red-500",
    },
    {
      label: "Total Spent",
      value: `₹${totalSpent.toLocaleString("en-IN")}`,
      icon: Wallet,
      color: "text-amber-600",
    },
  ];

  const menuItems = [
    {
      label: "Overview",
      href: "/account",
      icon: LayoutDashboard,
      active: true,
    },
    {
      label: "My Orders",
      href: "/orders",
      icon: ShoppingBag,
    },
    {
      label: "My Favorites",
      href: "/wishlist",
      icon: Heart,
    },
    {
      label: "My Cart",
      href: "/cart",
      icon: ShoppingCart,
      count: totalItems,
    },
    {
      label: "Profile",
      href: "/account/profile",
      icon: UserRound,
    },
    {
      label: "Addresses",
      href: "/account/addresses",
      icon: MapPin,
    },
  ];

  return (
    <main className="min-h-screen bg-[#f7f8f2] px-3 py-5 sm:px-5 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid items-stretch gap-5 md:grid-cols-[190px_minmax(0,1fr)] lg:grid-cols-[210px_minmax(0,1fr)]">

          {/* Sidebar */}
          <aside className="rounded-2xl border border-[#e9ede4] bg-white p-4 shadow-sm">
            {/* User profile */}
            <div className="mb-6 flex items-center gap-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#79dc83] text-sm font-bold text-white">
                {initials || "U"}
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-[#20392e]">
                  {user.name}
                </p>
                <p className="mt-1 truncate text-[10px] text-gray-500">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex min-h-9 items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                      item.active
                        ? "bg-gradient-to-r from-[#247744] to-[#318b50] text-white shadow-sm"
                        : "text-[#263b32] hover:bg-[#f0f5ef]"
                    }`}
                  >
                    <Icon size={15} />

                    <span className="flex-1">{item.label}</span>

                    {item.count !== undefined && item.count > 0 && (
                      <span
                        className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] ${
                          item.active
                            ? "bg-white text-[#247744]"
                            : "bg-[#247744] text-white"
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="mt-5 border-t border-[#edf0e9] pt-3">
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex w-full items-center gap-2.5 rounded-lg border border-[#f0f0eb] px-3 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                {loggingOut ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <LogOut size={15} />
                )}
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </aside>

          {/* Main dashboard */}
          <section className="min-w-0">
            {/* Page heading */}
            <div className="mb-5">
              <h1 className="text-2xl font-bold tracking-tight text-[#20392e]">
                My Account
              </h1>
              <p className="mt-1 text-xs text-gray-500">
                Manage your orders, profile, and preferences.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
                {error}
              </div>
            )}

            {/* Stats */}
            <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="flex min-h-[76px] items-center gap-3 rounded-xl border border-[#e9ede4] bg-white px-3 py-3 shadow-sm sm:px-4"
                  >
                    <div className={`shrink-0 ${stat.color}`}>
                      <Icon size={21} strokeWidth={1.9} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-lg font-bold leading-6 text-[#20392e]">
                        {stat.value}
                      </p>
                      <p className="text-[10px] text-gray-500 sm:text-[11px]">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent orders */}
            <section className="overflow-hidden rounded-xl border border-[#e9ede4] bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#20392e]">
                  Recent Orders
                </h2>

                <Link
                  href="/orders"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#247744] hover:underline"
                >
                  View All
                  <ArrowRight size={13} />
                </Link>
              </div>

              {orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.slice(0, 4).map((order) => {
                    const orderDate =
                      order.createdAt || order.created_at;

                    return (
                      <div
                        key={order._id}
                        className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0e9] pb-3 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f2f6ef] text-[#247744]">
                            <ShoppingBag size={19} />
                          </div>

                          <div>
                            <p className="text-xs font-bold text-[#20392e]">
                              Order #{order.orderNumber || order.order_number || order._id}
                            </p>
                            <p className="mt-1 text-[10px] text-gray-500">
                              {orderDate
                                ? new Date(orderDate).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "Date unavailable"}
                            </p>
                          </div>
                        </div>

                        <span className="rounded-full bg-[#e2f7e8] px-3 py-1.5 text-[10px] font-semibold capitalize text-[#247744]">
                          {order.status}
                        </span>

                        <p className="text-xs font-bold text-[#20392e]">
                          ₹{Number(order.total || 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex min-h-[125px] flex-col items-center justify-center rounded-lg bg-[#fafbf8] px-4 text-center">
                  <Clock3 size={25} className="text-[#8da595]" />
                  <p className="mt-2 text-xs font-semibold text-[#344c3e]">
                    No recent orders
                  </p>
                  <p className="mt-1 text-[10px] text-gray-500">
                    Your orders will appear here after your first purchase.
                  </p>
                  <Link
                    href="/products"
                    className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[#247744] hover:underline"
                  >
                    Explore products
                    <ChevronRight size={13} />
                  </Link>
                </div>
              )}
            </section>

            {/* Account details */}
            <section className="mt-5 rounded-xl border border-[#e9ede4] bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#20392e]">
                  Profile Information
                </h2>

                <CircleUserRound size={19} className="text-[#247744]" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-[#f7f9f4] p-3">
                  <p className="text-[10px] text-gray-500">Full name</p>
                  <p className="mt-1 text-xs font-semibold text-[#20392e]">
                    {user.name}
                  </p>
                </div>

                <div className="rounded-lg bg-[#f7f9f4] p-3">
                  <p className="text-[10px] text-gray-500">Email address</p>
                  <p className="mt-1 break-all text-xs font-semibold text-[#20392e]">
                    {user.email}
                  </p>
                </div>
              </div>
            </section>
          </section>
        </div>
      </div>
    </main>
  );
}