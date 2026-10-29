
"use client";

import {
  Search,
  UserRound,
  ShoppingBag,
  Menu,
  X,
  ArrowRight,
  Grid2X2,
  Sparkles,
  FlaskConical,
  LayoutGrid,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const navigation = [
  { label: "Explore", href: "/products", icon: LayoutGrid },
  { label: "Concern", href: "/products?concern=acne", icon: Sparkles },
  { label: "Category", href: "/products", icon: Grid2X2 },
  {
    label: "Ingredients",
    href: "/products?ingredient=niacinamide",
    icon: FlaskConical,
  },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { totalItems, ready } = useCart();
  const router = useRouter();

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = searchQuery.trim();
    if (!query) return;

    router.push(`/products?search=${encodeURIComponent(query)}`);
    setMobileSearchOpen(false);
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#e9e9e5] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="mx-auto grid h-[70px] max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6 lg:h-[76px] lg:px-10">
        {/* Mobile menu */}
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[#171714] transition hover:bg-[#f5f5f1] lg:hidden"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Henry's Store logo */}
        <Link
          href="/"
          className="justify-self-start whitespace-nowrap text-[19px] font-extrabold tracking-[-0.075em] text-[#172e24] sm:text-[23px]"
          aria-label="Henry's Store home"
        >
          HENRY&apos;S<span className="text-[#278475]">.</span>
          <span className="ml-1 hidden text-[9px] font-medium tracking-[0.16em] text-[#74746d] sm:inline">
            SKINCARE
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav
          className="hidden h-full items-stretch justify-center gap-1 lg:flex"
          aria-label="Main navigation"
        >
          {navigation.map(({ label, href, icon: Icon }, index) => (
            <Link
              key={label}
              href={href}
              className={`group flex min-w-[82px] flex-col items-center justify-center gap-1 px-3 text-center transition hover:bg-[#f7f8f5] ${
                index === 0
                  ? "rounded-t-xl text-[#167866]"
                  : "text-[#55564f] hover:text-[#167866]"
              }`}
            >
              <Icon
                size={17}
                strokeWidth={1.7}
                className="transition-transform group-hover:-translate-y-0.5"
              />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          ))}
        </nav>

        {/* Search and actions */}
        <div className="flex min-w-0 items-center justify-self-end gap-1 sm:gap-3">
          <form
            onSubmit={handleSearch}
            role="search"
            className="hidden w-[190px] items-center gap-2 rounded-xl border border-[#deded8] bg-white px-3 transition focus-within:border-[#278475] md:flex lg:w-[240px] xl:w-[270px]"
          >
            <Search
              size={20}
              strokeWidth={1.7}
              className="shrink-0 text-[#171714]"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="h-10 min-w-0 w-full bg-transparent text-sm outline-none placeholder:text-[#999990]"
            />
          </form>

          {/* Mobile search */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#f5f5f1] md:hidden"
            aria-label="Open search"
          >
            {mobileSearchOpen ? <X size={21} /> : <Search size={21} />}
          </button>

          <Link
            href="/login"
            className="hidden h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#f5f5f1] sm:flex"
            aria-label="My account"
          >
            <UserRound size={21} strokeWidth={1.7} />
          </Link>

          <Link
  href="/cart"
  className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#f5f5f1]"
  aria-label={`Shopping bag, ${totalItems} items`}
>
  <ShoppingBag size={22} strokeWidth={1.7} />

  {ready && totalItems > 0 && (
    <span className="absolute right-0 top-0 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#237d70] px-1 text-[10px] font-semibold text-white">
      {totalItems > 99 ? "99+" : totalItems}
    </span>
  )}
</Link>
        </div>
      </div>

      {/* Search panel for mobile and small tablets */}
      {mobileSearchOpen && (
        <div className="border-t border-[#eeeeea] bg-white px-4 py-4 md:hidden">
          <form
            onSubmit={handleSearch}
            role="search"
            className="mx-auto flex max-w-xl items-center gap-3 rounded-xl border border-[#deded8] px-4"
          >
            <Search size={19} className="shrink-0 text-[#74746d]" />
            <input
              autoFocus
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search products, ingredients..."
              aria-label="Search products"
              className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            <button type="submit" aria-label="Submit search">
              <ArrowRight size={19} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile navigation */}
      {mobileOpen && (
        <div className="border-t border-[#eeeeea] bg-white lg:hidden">
          <nav
            aria-label="Mobile navigation"
            className="mx-auto max-w-2xl px-5 py-3"
          >
            {navigation.map(({ label, href, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between border-b border-[#eeeeea] py-4 text-sm font-medium text-[#292a25] transition hover:text-[#278475]"
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} strokeWidth={1.7} />
                  {label}
                </span>
                <ArrowRight size={17} />
              </Link>
            ))}

            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between py-4 text-sm font-medium"
            >
              <span className="flex items-center gap-3">
                <UserRound size={18} />
                My Account
              </span>
              <ArrowRight size={17} />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
