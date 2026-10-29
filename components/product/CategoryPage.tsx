
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Product, ApiProduct } from "@/lib/products";

export default function CategoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          throw new Error("Invalid products response.");
        }

        const mapped: Product[] = data.products.map((item) => ({
          id: item._id,
          name: item.name,
          category: item.category?.trim() || "Skincare",
          concern: item.concern ?? "",
          ingredients: item.ingredients ?? "",
          price: item.price,
          originalPrice: item.originalPrice ?? item.price,
          image: item.image || item.images?.[0] || "",
          rating: item.rating ?? 0,
          reviews: item.reviewCount ?? 0,
          badge: item.badge,
          stock: item.stock ?? null,
        }));

        setProducts(mapped);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading products."
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadProducts();

    return () => controller.abort();
  }, []);

  const categoryGroups = useMemo(() => {
    const allCategories = Array.from(
      new Set(
        products
          .map((product) => product.category?.trim())
          .filter((category): category is string => Boolean(category))
      )
    ).sort((a, b) => a.localeCompare(b));

    return allCategories.slice(0, 5).map((category, index) => {
      const categoryProducts = products.filter(
        (product) =>
          product.category.trim().toLowerCase() === category.toLowerCase()
      );

      return {
        name: category,
        shortName:
          category.length > 13 ? `${category.slice(0, 12)}…` : category,
        color: [
          "bg-sky-100",
          "bg-rose-100",
          "bg-violet-100",
          "bg-orange-100",
          "bg-emerald-100",
        ][index],
        image: categoryProducts.find((product) => product.image)?.image || "",
        products: categoryProducts.slice(0, 4),
      };
    });
  }, [products]);

  const visibleGroups = selectedCategory
    ? categoryGroups.filter((group) => group.name === selectedCategory)
    : categoryGroups;

  return (
    <main className="min-h-screen overflow-x-clip bg-[#fffefa] text-[#171714]">
      <section className="bg-gradient-to-b from-[#eaf2ff] via-[#f7f9ff] to-[#fffefa] px-4 pb-8 pt-10 sm:px-6 sm:pt-12 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#237c70] shadow-sm sm:text-xs">
              <Sparkles size={14} />
              Skincare, thoughtfully selected
            </span>

            <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Shop by Category
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#74746d] sm:text-base">
              Discover skincare favourites by category in our product
              catalogue.
            </p>
          </div>

          {!loading && !error && (
            <div className="mx-auto mt-9 max-w-5xl">
              <div className="flex flex-wrap items-start justify-center gap-x-3 gap-y-5 sm:gap-x-5 sm:gap-y-6 lg:gap-x-7">
                {categoryGroups.map((category) => {
                  const active = selectedCategory === category.name;

                  return (
                    <button
                      key={category.name}
                      type="button"
                      onClick={() =>
                        setSelectedCategory(active ? "" : category.name)
                      }
                      aria-pressed={active}
                      className="group flex w-[88px] flex-col items-center gap-2 sm:w-[104px]"
                    >
                      <span
                        className={`relative block h-[72px] w-[72px] overflow-hidden rounded-full border-2 transition-all duration-200 sm:h-[84px] sm:w-[84px] ${
                          active
                            ? "scale-[1.04] border-[#168b7d] shadow-[0_5px_18px_rgba(35,124,112,0.18)]"
                            : "border-white/80 shadow-sm group-hover:-translate-y-0.5 group-hover:shadow-md"
                        }`}
                      >
                        <span className={`absolute inset-0 ${category.color}`} />

                        {category.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={category.image}
                            alt=""
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover mix-blend-multiply transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-[#237c70]">
                            {category.name.charAt(0).toUpperCase()}
                          </span>
                        )}

                        <span className="absolute inset-0 bg-white/10" />
                      </span>

                      <span
                        className={`min-h-8 text-center text-xs font-semibold leading-4 sm:text-sm ${
                          active
                            ? "text-[#168b7d]"
                            : "text-[#34342f] group-hover:text-[#168b7d]"
                        }`}
                      >
                        {category.shortName}
                      </span>

                      <span
                        className={`h-[2px] w-8 rounded-full transition-colors ${
                          active ? "bg-[#168b7d]" : "bg-transparent"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] space-y-12 px-4 pb-16 pt-8 sm:space-y-14 sm:px-6 lg:px-10">
        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-80 animate-pulse rounded-2xl bg-[#f0eee8]"
              />
            ))}
          </div>
        )}

        {error && (
          <p className="rounded-xl bg-red-50 p-5 text-center text-sm text-red-700">
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          visibleGroups.map((group) => (
            <section key={group.name}>
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#237c70] sm:text-xs">
                    Category collection
                  </p>

                  <h2 className="text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
                    Bestsellers in {group.name}
                  </h2>

                  <p className="mt-2 text-sm text-[#74746d]">
                    {group.products.length} products shown
                  </p>
                </div>

                <Link
                  href={`/products?category=${encodeURIComponent(group.name)}`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#deddd6] bg-white px-4 py-2.5 text-xs font-semibold transition hover:border-[#237c70] hover:text-[#237c70] sm:text-sm"
                >
                  View all <ArrowRight size={15} />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
                {group.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ))}

        {!loading && !error && categoryGroups.length === 0 && (
          <div className="mx-auto max-w-lg rounded-2xl border border-[#e8e5de] bg-white px-6 py-12 text-center">
            <h2 className="text-lg font-semibold">No categories found</h2>
            <p className="mt-2 text-sm leading-6 text-[#74746d]">
              Add categories to your products to display them here.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
