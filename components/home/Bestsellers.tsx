
"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/lib/products";

export default function Bestsellers() {
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadBestsellers() {
      try {
        const response = await fetch("/api/products", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        const items: Product[] = (data.products ?? [])
          .filter(
            (product: { price: number | null; badge?: string }) =>
              typeof product.price === "number" && product.price > 0
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
              badge: product.badge,
            })
          );

        setBestsellers(
          items.filter((product) => product.badge === "BESTSELLER").slice(0, 4)
        );
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Failed to load bestsellers:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadBestsellers();

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <section className="px-5 py-12 sm:px-10 lg:px-16">
        <p className="text-sm text-gray-500">Loading bestsellers...</p>
      </section>
    );
  }

  if (bestsellers.length === 0) {
    return null;
  }

  return (
    <section className="px-5 py-12 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
            Customer favourites
          </p>
          <h2 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">
            Bestsellers
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6">
          {bestsellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
