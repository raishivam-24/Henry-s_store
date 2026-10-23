
"use client";

import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/products";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [concern, setConcern] = useState("All");
  const [sort, setSort] = useState("featured");
  const [mobileFilters, setMobileFilters] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/products", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load products.");
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.products)) {
          throw new Error("The products API returned an invalid response.");
        }

        const mappedProducts: Product[] = data.products
          .filter(
            (product: {
              price: number | null;
              _id: string;
            }) =>
              typeof product.price === "number" &&
              product.price > 0
          )
          .map(
            (product: {
              _id: string;
              name: string;
              category: string;
              concern?: string;
              price: number;
              originalPrice: number | null;
              image: string;
              rating?: number;
              reviewCount?: number;
              badge?: string;
            }) => ({
              id: product._id,
              name: product.name,
              category: product.category,
              concern: product.concern ?? "",
              price: product.price,
              originalPrice: product.originalPrice ?? product.price,
              image: product.image,
              rating: product.rating ?? 0,
              reviews: product.reviewCount ?? 0,
              badge: product.badge || undefined,
            })
          );

        setProducts(mappedProducts);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading products."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => controller.abort();
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(products.map((product) => product.category))),
  ];

  const concerns = [
    "All",
    ...Array.from(new Set(products.map((product) => product.concern))),
  ];

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.concern.toLowerCase().includes(query)
      );
    }

    if (category !== "All") {
      result = result.filter((product) => product.category === category);
    }

    if (concern !== "All") {
      result = result.filter((product) => product.concern === concern);
    }

    if (sort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, search, category, concern, sort]);

  return (
    <main className="min-h-screen bg-[#f8f7f3]">
      <section className="border-b border-[#deddd6] bg-white px-5 py-14 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-[1400px]">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
            Henry&apos;s Store
          </p>

          <h1 className="mt-3 text-5xl font-medium tracking-[-0.05em] sm:text-6xl">
            Shop all products
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-6 text-gray-500">
            Explore skincare, haircare and wellness essentials selected for
            simple everyday routines.
          </p>
        </div>
      </section>

      <section className="sticky top-[76px] z-30 border-b border-[#deddd6] bg-[#f8f7f3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-4 sm:px-10 lg:px-16">
          <button
            onClick={() => setMobileFilters(true)}
            className="flex items-center gap-2 text-sm lg:hidden"
          >
            <SlidersHorizontal size={17} />
            Filters
          </button>

          <p className="hidden text-sm text-gray-500 sm:block">
            {loading ? "Loading products..." : `${filteredProducts.length} products`}
          </p>

          <div className="hidden max-w-sm flex-1 md:block">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="h-11 w-full rounded-full border border-[#d8d7d0] bg-white px-5 text-sm outline-none focus:border-[#1d392d]"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-11 rounded-full border border-[#d8d7d0] bg-white px-4 text-sm outline-none"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </section>

      <section className="mx-auto flex max-w-[1400px] gap-10 px-5 py-10 sm:px-10 lg:px-16">
        <aside className="hidden w-56 shrink-0 lg:block">
          <FilterGroup title="Category">
            {categories.map((item) => (
              <FilterButton
                key={item}
                active={category === item}
                onClick={() => setCategory(item)}
              >
                {item}
              </FilterButton>
            ))}
          </FilterGroup>

          <FilterGroup title="Concern">
            {concerns.map((item) => (
              <FilterButton
                key={item}
                active={concern === item}
                onClick={() => setConcern(item)}
              >
                {item || "Unspecified"}
              </FilterButton>
            ))}
          </FilterGroup>
        </aside>

        <div className="flex-1">
          <div className="mb-8 md:hidden">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="h-12 w-full rounded-full border border-[#d8d7d0] bg-white px-5 text-sm outline-none"
            />
          </div>

          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-2xl bg-white">
              <p className="text-sm text-gray-500">Loading products...</p>
            </div>
          ) : error ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-2xl bg-white p-6">
              <div className="text-center">
                <h2 className="text-xl font-medium">Could not load products</h2>
                <p className="mt-2 text-sm text-gray-500">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-5 rounded-full bg-[#1d392d] px-6 py-3 text-sm text-white"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-2xl bg-white">
              <div className="text-center">
                <h2 className="text-xl font-medium">
                  {products.length === 0 ? "Products coming soon" : "No products found"}
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  {products.length === 0
                    ? "Our product catalog is being prepared. Please check back soon."
                    : "Try another search or filter."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-x-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {mobileFilters && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFilters(false)}
          />

          <aside className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-[#f8f7f3] p-6">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xl font-medium">Filters</h2>
              <button
                onClick={() => setMobileFilters(false)}
                aria-label="Close filters"
              >
                <X size={22} />
              </button>
            </div>

            <FilterGroup title="Category">
              {categories.map((item) => (
                <FilterButton
                  key={item}
                  active={category === item}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </FilterButton>
              ))}
            </FilterGroup>

            <FilterGroup title="Concern">
              {concerns.map((item) => (
                <FilterButton
                  key={item}
                  active={concern === item}
                  onClick={() => setConcern(item)}
                >
                  {item || "Unspecified"}
                </FilterButton>
              ))}
            </FilterGroup>

            <button
              onClick={() => setMobileFilters(false)}
              className="mt-6 w-full rounded-full bg-[#1d392d] py-4 text-sm font-medium text-white"
            >
              Show {filteredProducts.length} products
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-10">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em]">
        {title}
      </h3>
      <div className="flex flex-col items-start gap-2">{children}</div>
    </div>
  );
}

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left text-sm transition ${
        active
          ? "font-medium text-[#1d392d]"
          : "text-gray-500 hover:text-black"
      }`}
    >
      {children}
    </button>
  );
}
