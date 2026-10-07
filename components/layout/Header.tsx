"use client";

import {
  Search,
  UserRound,
  ShoppingBag,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#deddd6] bg-[#f8f7f3]/95 backdrop-blur-md">

        <div className="mx-auto flex h-[76px] max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">

          {/* Mobile Menu */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center lg:hidden"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? (
              <X size={22} strokeWidth={1.6} />
            ) : (
              <Menu size={22} strokeWidth={1.6} />
            )}
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 text-[21px] font-bold tracking-[-0.07em] lg:static lg:translate-x-0"
          >
            HENRY&apos;S.
          </Link>

          {/* Desktop Navigation */}
          <nav className="ml-12 hidden items-center gap-7 lg:flex">

            <Link
              href="/products"
              className="text-[13px] transition hover:text-[#1d392d]"
            >
              Shop
            </Link>

            <Link
              href="/products?concern=acne"
              className="text-[13px] transition hover:text-[#1d392d]"
            >
              Skin Concerns
            </Link>

            <Link
              href="/products?ingredient=niacinamide"
              className="text-[13px] transition hover:text-[#1d392d]"
            >
              Ingredients
            </Link>

            <Link
              href="/products?sort=featured"
              className="text-[13px] transition hover:text-[#1d392d]"
            >
              Bestsellers
            </Link>

            <Link
              href="#story"
              className="text-[13px] transition hover:text-[#1d392d]"
            >
              Our Story
            </Link>

          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-3">

            {/* Search */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-black/5"
              aria-label="Search"
            >
              <Search
                size={19}
                strokeWidth={1.6}
              />
            </button>

            {/* Account */}
            <Link
              href="/login"
              className="hidden h-10 w-10 items-center justify-center rounded-full transition hover:bg-black/5 sm:flex"
              aria-label="Account"
            >
              <UserRound
                size={19}
                strokeWidth={1.6}
              />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-black/5"
              aria-label="Shopping cart"
            >
              <ShoppingBag
                size={19}
                strokeWidth={1.6}
              />

              <span className="absolute right-0 top-0 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#1d392d] px-1 text-[9px] font-medium text-white">
                0
              </span>
            </Link>

          </div>
        </div>

        {/* Search Panel */}
        {searchOpen && (
          <div className="border-t border-[#deddd6] bg-[#f8f7f3] px-5 py-5">

            <div className="mx-auto max-w-[800px]">

              <div className="flex items-center gap-3 rounded-full border border-[#d4d3cc] bg-white px-5 py-1">

                <Search
                  size={18}
                  className="shrink-0 text-gray-500"
                />

                <input
                  autoFocus
                  type="text"
                  placeholder="Search products, ingredients or concerns..."
                  className="h-12 flex-1 bg-transparent text-sm outline-none"
                />

                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100"
                >
                  <X size={15} />
                </button>

              </div>

              <div className="mt-5 flex flex-wrap gap-2">

                <span className="text-xs text-gray-500">
                  Popular:
                </span>

                <Link
                  href="/products?search=serum"
                  className="text-xs underline underline-offset-4"
                >
                  Serum
                </Link>

                <Link
                  href="/products?search=vitamin+c"
                  className="text-xs underline underline-offset-4"
                >
                  Vitamin C
                </Link>

                <Link
                  href="/products?search=acne"
                  className="text-xs underline underline-offset-4"
                >
                  Acne
                </Link>

              </div>

            </div>

          </div>
        )}

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="border-t border-[#deddd6] bg-[#f8f7f3] lg:hidden">

            <nav className="mx-auto max-w-[1400px] px-6 py-7">

              <div className="flex flex-col">

                <MobileLink
                  href="/products"
                  onClick={() => setMobileOpen(false)}
                >
                  Shop
                </MobileLink>

                <MobileLink
                  href="/products?concern=acne"
                  onClick={() => setMobileOpen(false)}
                >
                  Skin Concerns
                </MobileLink>

                <MobileLink
                  href="/products?ingredient=niacinamide"
                  onClick={() => setMobileOpen(false)}
                >
                  Ingredients
                </MobileLink>

                <MobileLink
                  href="/products?sort=featured"
                  onClick={() => setMobileOpen(false)}
                >
                  Bestsellers
                </MobileLink>

                <MobileLink
                  href="#story"
                  onClick={() => setMobileOpen(false)}
                >
                  Our Story
                </MobileLink>

              </div>

              <div className="mt-6 border-t border-[#deddd6] pt-6">

                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between text-sm"
                >
                  My Account

                  <ArrowRight size={16} />
                </Link>

              </div>

            </nav>

          </div>
        )}

      </header>
    </>
  );
}

function MobileLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center justify-between border-b border-[#deddd6] py-5 text-lg"
    >
      {children}

      <ArrowRight size={18} />
    </Link>
  );
}