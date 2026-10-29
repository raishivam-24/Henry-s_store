
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Mail,
  MapPin,
  Truck,
  RotateCcw,
  WalletCards,
  ArrowUpRight,
} from "lucide-react";

type ApiProduct = {
  _id: string;
  category?: string;
  isActive?: boolean;
};

const usefulLinks = [
  { label: "Shop All Products", href: "/products" },
  { label: "Shopping Cart", href: "/cart" },
  { label: "My Account", href: "/account" },
];

const accountLinks = [
  { label: "Account", href: "/account" },
  { label: "Orders", href: "/account/orders" },
  { label: "Cart", href: "/cart" },
];

export default function Footer() {
  const [categories, setCategories] = useState<string[]>([]);
const [currentYear, setCurrentYear] = useState<number | null>(null);

useEffect(() => {
  setCurrentYear(new Date().getFullYear());
}, []);
  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        const response = await fetch("/api/products", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) return;

        const data: { products?: ApiProduct[] } = await response.json();

        const names = Array.from(
          new Set(
            (data.products ?? [])
              .filter((product) => product.isActive !== false)
              .map((product) => product.category?.trim())
              .filter((name): name is string => Boolean(name))
          )
        ).sort((a, b) => a.localeCompare(b));

        if (!controller.signal.aborted) {
          setCategories(names.slice(0, 10));
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Footer categories could not be loaded:", error);
        }
      }
    }

    loadCategories();

    return () => controller.abort();
  }, []);

  return (
    <footer className="border-t border-[#e9e7e2] bg-white text-[#242720]">
      {/* Main footer columns */}
      <div className="mx-auto max-w-[1500px] px-5 pb-10 pt-12 sm:px-8 sm:pt-16 lg:px-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.9fr_1fr_0.8fr_1.1fr] lg:gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-baseline">
              <span className="text-3xl font-black tracking-[-0.09em]">
                HENRY&apos;S
              </span>
              <span className="ml-1 text-2xl font-bold text-[#239b91]">
                .
              </span>
              <span className="ml-2 text-[10px] font-semibold tracking-[0.18em] text-[#77796f]">
                SKINCARE
              </span>
            </Link>

            <p className="mt-6 max-w-xs text-sm leading-6 text-[#65675f]">
              Discover skincare and personal-care essentials for your
              everyday routine.
            </p>

            <Link
              href="/products"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#173e32] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#245744]"
            >
              Explore products
              <ArrowUpRight size={16} />
            </Link>

            <div className="mt-7 space-y-3 text-sm text-[#65675f]">
              <p className="flex items-start gap-3">
                <Mail size={17} className="mt-0.5 shrink-0 text-[#239b91]" />
                <span>Contact us through our official store contact details.</span>
              </p>
              <p className="flex items-start gap-3">
                <MapPin size={17} className="mt-0.5 shrink-0 text-[#239b91]" />
                <span>Shop skincare essentials online.</span>
              </p>
            </div>
          </div>

          {/* Useful links */}
          <div>
            <h3 className="text-sm font-semibold">Useful Links</h3>

            <ul className="mt-5 space-y-4">
              {usefulLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-[#55574f] transition hover:text-[#15968a]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Catalogue-driven categories */}
          <div>
            <h3 className="text-sm font-semibold">Top Categories</h3>

            <ul className="mt-5 space-y-4">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <li key={category}>
                    <Link
                      href={`/products?category=${encodeURIComponent(category)}`}
                      className="text-sm text-[#55574f] transition hover:text-[#15968a]"
                    >
                      {category}
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  <Link
                    href="/products"
                    className="text-sm text-[#55574f] hover:text-[#15968a]"
                  >
                    Browse all products
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold">My Account</h3>

            <ul className="mt-5 space-y-4">
              {accountLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-[#55574f] transition hover:text-[#15968a]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social links */}
          <div>
            <h3 className="text-sm font-semibold">
              Show us some love on social media
            </h3>

            <div className="mt-6 flex items-center gap-5">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="text-[#252720] transition hover:text-[#15968a]"
              >
              
              </a>

              <a
                href="mailto:"
                aria-label="Email"
                className="text-[#252720] transition hover:text-[#15968a]"
              >
                <Mail size={19} />
              </a>
            </div>

            <div className="mt-7 border-t border-[#e8e7e1] pt-6">
              <p className="text-xs leading-5 text-[#77796f]">
                Follow Henry&apos;s Store for updates and new product
                announcements.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Service benefits */}
      <div className="border-t border-[#e9e7e2]">
        <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-6 px-5 py-8 sm:grid-cols-3 sm:px-8 lg:px-12">
          <div className="flex items-center justify-center gap-4 sm:justify-start">
            <Truck size={29} strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium">Shipping Information</p>
              <p className="mt-1 text-xs text-[#77796f]">
                Check delivery details at checkout.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 sm:justify-center">
            <RotateCcw size={29} strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium">Returns & Exchanges</p>
              <p className="mt-1 text-xs text-[#77796f]">
                Review the applicable store policy.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 sm:justify-end">
            <WalletCards size={29} strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium">Payment Options</p>
              <p className="mt-1 text-xs text-[#77796f]">
                Available payment methods at checkout.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-[#e9e7e2] bg-[#faf9f6]">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-5 py-5 text-xs text-[#77796f] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <p>
  © {currentYear ?? 2026} Henry&apos;s Store. All rights reserved.
</p>
          <Link href="/products" className="hover:text-[#15968a]">
            Shop the collection
          </Link>
        </div>
      </div>
    </footer>
  );
}
