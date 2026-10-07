"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/products";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({
  product,
}: ProductCardProps) {
  const discount = Math.round(
    ((product.originalPrice - product.price) /
      product.originalPrice) *
      100
  );

  return (
    <article className="group relative">
      {/* Product Image */}
      <div className="relative">

        <Link
          href={`/product/${product.id}`}
          className="block"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#efeee8]">

            {/* Badge */}
            {product.badge && (
              <span className="absolute left-4 top-4 z-20 rounded-full bg-[#1d392d] px-3 py-1.5 text-[9px] font-semibold tracking-[0.12em] text-white">
                {product.badge}
              </span>
            )}

            {/* Wishlist */}
            <button
              type="button"
              aria-label="Add to wishlist"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-sm transition duration-300 group-hover:opacity-100 hover:bg-white"
            >
              <Heart
                size={16}
                strokeWidth={1.7}
              />
            </button>

            {/* Product Image */}
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-8 transition duration-700 group-hover:scale-105"
            />

          </div>
        </Link>

        {/* Add to Bag */}
        <button
          type="button"
          className="absolute bottom-4 left-4 right-4 z-30 flex translate-y-3 items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-medium opacity-0 shadow-xl transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-[#1d392d] hover:text-white"
        >
          <ShoppingBag size={16} />
          Add to bag
        </button>

      </div>

      {/* Product Details */}
      <div className="pt-4">

        {/* Rating */}
        <div className="flex items-center gap-1">

          <Star
            size={13}
            fill="currentColor"
            strokeWidth={1.5}
          />

          <span className="text-xs">
            {product.rating}
          </span>

          <span className="text-xs text-gray-400">
            ({product.reviews})
          </span>

        </div>

        {/* Product Name */}
        <Link href={`/product/${product.id}`}>
          <h3 className="mt-2 text-sm font-medium leading-5 transition hover:opacity-60">
            {product.name}
          </h3>
        </Link>

        {/* Category */}
        <p className="mt-1 text-xs text-gray-500">
          {product.category}
        </p>

        {/* Price */}
        <div className="mt-3 flex flex-wrap items-center gap-2">

          <span className="text-sm font-semibold">
            ₹{product.price}
          </span>

          <span className="text-xs text-gray-400 line-through">
            ₹{product.originalPrice}
          </span>

          <span className="text-[10px] font-medium text-green-700">
            {discount}% OFF
          </span>

        </div>

      </div>
    </article>
  );
}