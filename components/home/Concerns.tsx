
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

type ApiProduct = {
  _id: string;
  name: string;
  category?: string;
  image?: string;
  images?: string[];
  isActive?: boolean;
};

type CategoryCard = {
  name: string;
  count: number;
  image: string;
};

export default function Concerns() {
  const [categories, setCategories] = useState<CategoryCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        const response = await fetch("/api/products", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Could not load product categories.");
        }

        const data: {
          success?: boolean;
          products?: ApiProduct[];
        } = await response.json();

        if (!Array.isArray(data.products)) {
          throw new Error("Invalid products API response.");
        }

        const grouped = new Map<
          string,
          { name: string; count: number; image: string }
        >();

        for (const product of data.products) {
          if (product.isActive === false) continue;

          const name = product.category?.trim();
          if (!name) continue;

          const key = name.toLowerCase();
          const productImage =
            product.image || product.images?.find(Boolean) || "";

          const existing = grouped.get(key);

          if (existing) {
            existing.count += 1;

            // Prefer a real product image if the current one is empty.
            if (!existing.image && productImage) {
              existing.image = productImage;
            }
          } else {
            grouped.set(key, {
              name,
              count: 1,
              image: productImage,
            });
          }
        }

        const result = Array.from(grouped.values()).sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        if (!controller.signal.aborted) {
          setCategories(result.slice(0, 8));
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("Category loading failed:", error);

        if (!controller.signal.aborted) {
          setCategories([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadCategories();

    return () => controller.abort();
  }, []);

  if (!loading && categories.length === 0) {
    return null;
  }

  return (
    <section
      id="concerns"
      className="bg-[#faf9f6] px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#71816a]">
              Explore our collection
            </p>

            <h2 className="text-2xl font-semibold tracking-tight text-[#20271f] sm:text-3xl">
              Shop by Category
            </h2>

            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              Explore categories from our product catalogue.
            </p>
          </div>

          <Link
            href="/products"
            className="hidden items-center gap-2 text-sm font-medium text-[#244b39] hover:underline sm:inline-flex"
          >
            View all
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Loading skeletons */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[20px] bg-white shadow-sm"
              >
                <div className="h-[150px] animate-pulse bg-[#eeece6] sm:h-[180px] lg:h-[220px]" />

                <div className="space-y-3 p-4 sm:p-5">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-[#eeece6]" />
                  <div className="h-4 w-full animate-pulse rounded bg-[#eeece6]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Category cards: maximum 8 */
          <div className="grid grid-cols-2 items-stretch gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/products?category=${encodeURIComponent(category.name)}`}
                className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-black/5 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Image */}
                
{/* Full product image, like the Bestseller cards */}
<div className="relative h-[220px] overflow-hidden bg-[#f8f7f4] sm:h-[260px] lg:h-[280px]">
  {category.image ? (
    <Image
      src={category.image}
      alt={category.name}
      fill
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.03]"
    />
  ) : (
    <div className="flex h-full items-center justify-center text-sm text-gray-500">
      {category.name}
    </div>
  )}

  <span className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#244b39] shadow-sm transition group-hover:bg-[#244b39] group-hover:text-white">
    <ArrowRight size={18} />
  </span>
</div>


                {/* Card details */}
                <div className="flex flex-1 flex-col p-3 sm:p-5">
                  <h3 className="line-clamp-2 min-h-[48px] text-base font-semibold leading-6 text-[#20271f] sm:text-lg">
                    {category.name}
                  </h3>

                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
                    <span className="text-xs text-gray-500 sm:text-sm">
                      {category.count}{" "}
                      {category.count === 1 ? "product" : "products"}
                    </span>

                    <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-[#244b39] sm:text-sm">
                      Explore
                      <ArrowRight
                        size={14}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Mobile view-all link */}
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#244b39] hover:underline sm:hidden"
        >
          View all products
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
