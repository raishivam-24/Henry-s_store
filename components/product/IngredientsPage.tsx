
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Product, ApiProduct } from "@/lib/products";

const INGREDIENTS = [
  {
    name: "Hyaluronic Acid",
    shortName: "Hyaluronic",
    keywords: ["hyaluronic acid", "hyaluronate"],
    image:
      "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=240&q=80",
    color: "bg-sky-100",
  },
  {
    name: "Kojic Acid",
    shortName: "Kojic",
    keywords: ["kojic acid"],
    image:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=240&q=80",
    color: "bg-rose-100",
  },
  {
    name: "Niacinamide",
    shortName: "Niacinamide",
    keywords: ["niacinamide"],
    image:
      "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=240&q=80",
    color: "bg-violet-100",
  },
  {
    name: "Vitamin C",
    shortName: "Vitamin C",
    keywords: ["vitamin c", "ascorbic acid"],
    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=240&q=80",
    color: "bg-orange-100",
  },
  {
    name: "Salicylic Acid",
    shortName: "Salicylic",
    keywords: ["salicylic acid"],
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=240&q=80",
    color: "bg-pink-100",
  },
  {
    name: "Sali-Cinamide",
    shortName: "Sali-Cinamide",
    keywords: ["sali-cinamide", "salicinamide"],
    image:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=240&q=80",
    color: "bg-purple-100",
  },
  {
    name: "Retinol",
    shortName: "Retinol",
    keywords: ["retinol", "retinal"],
    image:
      "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=240&q=80",
    color: "bg-amber-100",
  },
  {
    name: "Ceramides",
    shortName: "Ceramides",
    keywords: ["ceramide", "ceramides"],
    image:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=240&q=80",
    color: "bg-emerald-100",
  },
];

export default function IngredientsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState("");
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

  const ingredientGroups = useMemo(() => {
    return INGREDIENTS.map((ingredient) => {
      const matchingProducts = products.filter((product) => {
        const ingredientsText = Array.isArray(product.ingredients)
          ? product.ingredients.join(" ")
          : product.ingredients ?? "";

        const searchableText = [
          product.name,
          product.category,
          product.concern,
          ingredientsText,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return ingredient.keywords.some((keyword) =>
          searchableText.includes(keyword)
        );
      });

      return {
        ...ingredient,
        products: matchingProducts,
      };
    }).filter((group) => group.products.length > 0);
  }, [products]);

  const visibleGroups = selectedIngredient
    ? ingredientGroups.filter(
        (group) => group.name === selectedIngredient
      )
    : ingredientGroups;

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
              Shop by Ingredient
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#74746d] sm:text-base">
              Discover skincare favourites by the ingredients listed
              in our product catalogue.
            </p>
          </div>

          {!loading && !error && (
            <div className="mx-auto mt-9 max-w-5xl">
              <div className="flex flex-wrap items-start justify-center gap-x-3 gap-y-5 sm:gap-x-5 sm:gap-y-6 lg:gap-x-7">
                {ingredientGroups.map((ingredient) => {
                  const active =
                    selectedIngredient === ingredient.name;

                  return (
                    <button
                      key={ingredient.name}
                      type="button"
                      onClick={() =>
                        setSelectedIngredient(
                          active ? "" : ingredient.name
                        )
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
                        <span
                          className={`absolute inset-0 ${ingredient.color}`}
                        />

                        {/* Ingredient texture image */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ingredient.image}
                          alt=""
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover mix-blend-multiply transition-transform duration-300 group-hover:scale-110"
                        />

                        <span className="absolute inset-0 bg-white/10" />
                      </span>

                      <span
                        className={`min-h-8 text-center text-xs font-semibold leading-4 sm:text-sm ${
                          active
                            ? "text-[#168b7d]"
                            : "text-[#34342f] group-hover:text-[#168b7d]"
                        }`}
                      >
                        {ingredient.shortName}
                      </span>

                      <span
                        className={`h-[2px] w-8 rounded-full transition-colors ${
                          active
                            ? "bg-[#168b7d]"
                            : "bg-transparent"
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
                    Ingredient collection
                  </p>

                  <h2 className="text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
                    Bestsellers with {group.name}
                  </h2>

                  <p className="mt-2 text-sm text-[#74746d]">
                    {group.products.length} matching{" "}
                    {group.products.length === 1
                      ? "product"
                      : "products"}
                  </p>
                </div>

                <Link
                  href={`/products?ingredient=${encodeURIComponent(group.name)}`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#deddd6] bg-white px-4 py-2.5 text-xs font-semibold transition hover:border-[#237c70] hover:text-[#237c70] sm:text-sm"
                >
                  View all <ArrowRight size={15} />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
                {group.products.slice(0, 4).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            </section>
          ))}

        {!loading && !error && visibleGroups.length === 0 && (
          <div className="mx-auto max-w-lg rounded-2xl border border-[#e8e5de] bg-white px-6 py-12 text-center">
            <h2 className="text-lg font-semibold">
              No matching ingredients found
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#74746d]">
              The current catalogue has no matching products for these
              ingredient names.
            </p>

            <button
              type="button"
              onClick={() => setSelectedIngredient("")}
              className="mt-5 rounded-full bg-[#237c70] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1d392d]"
            >
              Show all ingredients
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
