
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  X,
  Search,
  RotateCcw,
} from "lucide-react";
import ProductCard from "./ProductCard";
import type { Product, ApiProduct } from "@/lib/products";

const normalize = (value?: string | null) =>
  (value ?? "").trim().toLowerCase();

function ingredientText(value: string | string[] | undefined) {
  return Array.isArray(value) ? value.join(" ") : value ?? "";
}

export default function ProductsPage() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [concern, setConcern] = useState("All");
  const [ingredient, setIngredient] = useState("");
  const [sort, setSort] = useState("featured");
  const [mobileFilters, setMobileFilters] = useState(false);

  // Read homepage filters when the URL changes.
  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
    setCategory(searchParams.get("category") || "All");
    setConcern(searchParams.get("concern") || "All");
    setIngredient(searchParams.get("ingredient") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/products", {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load products.");
        }

        const data: {
          success: boolean;
          products: ApiProduct[];
        } = await response.json();

        if (!data.success || !Array.isArray(data.products)) {
          throw new Error("Invalid response from products API.");
        }

        const mapped: Product[] = data.products.map((item) => ({
          id: item._id,
          name: item.name,
          category: item.category ?? "",
          concern: item.concern ?? "",
          ingredients: item.ingredients ?? "",
          price: item.price,
          originalPrice: item.originalPrice,
          image: item.image || item.images?.[0] || "",
          rating: item.rating ?? 0,
          reviews: item.reviewCount ?? 0,
          badge: item.badge,
          stock: item.stock ?? null,
        }));

        if (!controller.signal.aborted) {
          setProducts(mapped);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        if (!controller.signal.aborted) {
          setError(
            err instanceof Error ? err.message : "Unable to load products."
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadProducts();
    return () => controller.abort();
  }, []);

  // Categories always come from active products returned by the API.
  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          products
            .map((product) => product.category?.trim())
            .filter((value): value is string => Boolean(value))
        )
      ).sort((a, b) => a.localeCompare(b)),
    ],
    [products]
  );

  const concerns = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          products
            .map((product) => product.concern?.trim())
            .filter((value): value is string => Boolean(value))
        )
      ).sort((a, b) => a.localeCompare(b)),
    ],
    [products]
  );

  const filteredProducts = useMemo(() => {
    let result = [...products];
    const searchTerm = normalize(search);
    const ingredientTerm = normalize(ingredient);
    const selectedCategory = normalize(category);
    const selectedConcern = normalize(concern);

    if (searchTerm) {
      result = result.filter((product) => {
        const searchable = [
          product.name,
          product.category,
          product.concern,
          ingredientText(product.ingredients),
        ]
          .filter(Boolean)
          .join(" ");

        return normalize(searchable).includes(searchTerm);
      });
    }

    if (ingredientTerm) {
      result = result.filter((product) =>
        normalize(ingredientText(product.ingredients)).includes(ingredientTerm)
      );
    }

    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter(
        (product) => normalize(product.category) === selectedCategory
      );
    }

    if (selectedConcern && selectedConcern !== "all") {
      result = result.filter(
        (product) => normalize(product.concern) === selectedConcern
      );
    }

    if (sort === "price-low") {
      result.sort(
        (a, b) =>
          (a.price ?? Number.MAX_SAFE_INTEGER) -
          (b.price ?? Number.MAX_SAFE_INTEGER)
      );
    } else if (sort === "price-high") {
      result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    } else if (sort === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sort === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, search, ingredient, category, concern, sort]);

  // Manual search clears other filters so they cannot silently hide results.
  function handleSearch(value: string) {
    setSearch(value);
    setCategory("All");
    setConcern("All");
    setIngredient("");
  }

  function clearFilters() {
    setSearch("");
    setCategory("All");
    setConcern("All");
    setIngredient("");
    setSort("featured");
  }

  const hasActiveFilters =
    Boolean(search.trim()) ||
    category !== "All" ||
    concern !== "All" ||
    Boolean(ingredient.trim());

  return (
    <main className="min-h-screen bg-[#faf9f6] text-[#171714]">
      <section className="border-b border-[#e9e7df] bg-white px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <div className="mx-auto max-w-[1500px]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#237d70]">
            HENRY&apos;S SKINCARE
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Find your skincare.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#73736b] sm:text-base">
            Explore products from our catalogue. Find your favourites by
            category, ingredient or skin concern.
          </p>
        </div>
      </section>

      {/* Keep category selection here only, not in the desktop sidebar. */}
      <section className="border-b border-[#e9e7df] bg-[#f3f5ef] px-5 py-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1500px]">
          <h2 className="text-sm font-semibold">Shop by category</h2>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                aria-pressed={category === item}
                className={`shrink-0 rounded-full border px-4 py-2.5 text-xs transition sm:text-sm ${
                  category === item
                    ? "border-[#1d392d] bg-[#1d392d] text-white"
                    : "border-[#deddd6] bg-white hover:border-[#1d392d]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="sticky top-[76px] z-30 border-b border-[#e9e7df] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-5 py-3 sm:px-8 lg:px-12">
          <button
            type="button"
            onClick={() => setMobileFilters(true)}
            className="flex h-11 shrink-0 items-center gap-2 rounded-full border border-[#deddd6] px-4 text-sm lg:hidden"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>

          <label className="relative min-w-0 flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="h-11 w-full rounded-full border border-[#deddd6] bg-[#faf9f6] pl-11 pr-4 text-sm outline-none focus:border-[#237d70]"
            />
          </label>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            aria-label="Sort products"
            className="h-11 max-w-[150px] rounded-full border border-[#deddd6] bg-white px-3 text-xs sm:text-sm"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="name">Name: A–Z</option>
          </select>
        </div>
      </section>

      <section
        id="product-grid"
        className="mx-auto max-w-[1500px] px-4 py-8 sm:px-8 sm:py-10 lg:px-12"
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#237d70]">
              The collection
            </p>
            <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">
              {category !== "All"
                ? category
                : concern !== "All"
                  ? concern
                  : ingredient
                    ? `Ingredient: ${ingredient}`
                    : search
                      ? `Results for "${search}"`
                      : "All products"}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {loading
                ? "Loading products..."
                : `${filteredProducts.length} products found`}
            </p>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-2 text-sm text-[#237d70] hover:underline"
            >
              <RotateCcw size={15} />
              Clear filters
            </button>
          )}
        </div>

        <div className="flex items-start gap-8">
          {/* No duplicate category group in this sidebar. */}
          <aside className="sticky top-36 hidden w-56 shrink-0 rounded-2xl border border-[#e9e7df] bg-white p-5 lg:block">
            <h3 className="mb-5 font-semibold">Filters</h3>

            {concerns.length > 1 && (
              <FilterGroup title="Skin concern">
                {concerns.map((item) => (
                  <FilterButton
                    key={item}
                    active={concern === item}
                    onClick={() => setConcern(item)}
                  >
                    {item === "All" ? "All concerns" : item}
                  </FilterButton>
                ))}
              </FilterGroup>
            )}

            <button
              type="button"
              onClick={clearFilters}
              className="w-full rounded-full border border-[#deddd6] py-2.5 text-sm hover:border-[#1d392d]"
            >
              Reset filters
            </button>
          </aside>

          <div className="min-w-0 flex-1">
            {loading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-2xl bg-white"
                  >
                    <div className="aspect-[4/5] rounded-2xl bg-[#eeede7]" />
                    <div className="space-y-3 p-4">
                      <div className="h-3 rounded bg-[#eeede7]" />
                      <div className="h-4 rounded bg-[#eeede7]" />
                      <div className="h-10 rounded bg-[#eeede7]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl bg-white p-10 text-center">
                <h3 className="text-lg font-semibold">
                  Could not load products
                </h3>
                <p className="mt-2 text-sm text-gray-500">{error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-5 rounded-full bg-[#1d392d] px-6 py-3 text-sm text-white"
                >
                  Try again
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-2xl bg-white px-5 py-16 text-center">
                <Search size={24} className="mx-auto text-[#237d70]" />
                <h3 className="mt-4 text-xl font-semibold">
                  No matching products
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Try another search term or clear your filters.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-full bg-[#1d392d] px-6 py-3 text-sm text-white"
                >
                  Show all products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile filters */}
      {mobileFilters && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 h-full w-full bg-black/40"
            onClick={() => setMobileFilters(false)}
          />

          <aside className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-[#faf9f6] p-6">
            <div className="mb-7 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFilters(false)}
                aria-label="Close filter panel"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white"
              >
                <X size={20} />
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

            {concerns.length > 1 && (
              <FilterGroup title="Skin concern">
                {concerns.map((item) => (
                  <FilterButton
                    key={item}
                    active={concern === item}
                    onClick={() => setConcern(item)}
                  >
                    {item === "All" ? "All concerns" : item}
                  </FilterButton>
                ))}
              </FilterGroup>
            )}

            <div className="sticky bottom-0 flex gap-3 bg-[#faf9f6] py-3">
              <button
                type="button"
                onClick={clearFilters}
                className="flex-1 rounded-full border border-[#deddd6] py-3 text-sm"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFilters(false)}
                className="flex-1 rounded-full bg-[#1d392d] py-3 text-sm font-medium text-white"
              >
                Show {filteredProducts.length} products
              </button>
            </div>
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
    <div className="mb-7">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
        {title}
      </h3>
      <div className="flex flex-col items-start gap-2.5">{children}</div>
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
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`text-left text-sm transition ${
        active
          ? "font-semibold text-[#237d70]"
          : "text-gray-600 hover:text-[#1d392d]"
      }`}
    >
      {children}
    </button>
  );
}
