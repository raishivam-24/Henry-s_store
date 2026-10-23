
"use client";

import Image from "next/image";
import type { Product } from "@/lib/products";

type ProductDetailProps = {
  product: {
    _id?: string;
    id?: string | number;
    name: string;
    category: string;
    concern?: string;
    description?: string;
    price: number | null;
    originalPrice: number | null;
    image: string;
    images?: string[];
    rating?: number;
    reviewCount?: number;
    badge?: string;
  };
};

export default function ProductDetail({ product }: ProductDetailProps) {
  const price = product.price;
  const originalPrice = product.originalPrice;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
          {product.image ? (
            <Image
              src={product.image.startsWith("/")
                ? product.image
                : `/images/products/${product.image}`}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-6"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              Image unavailable
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          {product.badge && (
            <span className="mb-3 w-fit rounded-full bg-gray-100 px-3 py-1 text-sm">
              {product.badge}
            </span>
          )}

          <p className="text-sm uppercase tracking-wider text-gray-500">
            {product.category}
          </p>

          <h1 className="mt-2 text-3xl font-semibold">{product.name}</h1>

          {product.concern && (
            <p className="mt-3 text-gray-600">{product.concern}</p>
          )}

          {product.description && (
            <p className="mt-5 leading-7 text-gray-700">
              {product.description}
            </p>
          )}

          <div className="mt-6 flex items-center gap-3">
            {price !== null ? (
              <span className="text-2xl font-semibold">₹{price}</span>
            ) : (
              <span className="text-sm text-amber-700">
                Price to be confirmed
              </span>
            )}

            {originalPrice !== null &&
              price !== null &&
              originalPrice > price && (
                <span className="text-gray-500 line-through">
                  ₹{originalPrice}
                </span>
              )}
          </div>

          {typeof product.rating === "number" && product.rating > 0 && (
            <p className="mt-3 text-sm text-gray-600">
              ★ {product.rating.toFixed(1)} ({product.reviewCount ?? 0} reviews)
            </p>
          )}

          <p className="mt-6 text-sm text-gray-500">
            Product details and availability are subject to confirmation.
          </p>
        </div>
      </div>
    </main>
  );
}
