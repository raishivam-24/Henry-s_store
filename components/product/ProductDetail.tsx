
"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Minus,
  Plus,
  ShoppingBag,
  Star,
} from "lucide-react";

type Product = {
  _id: string;
  name: string;
  slug?: string;
  category: string;
  concern?: string;
  description: string;
  ingredients?: string[];
  price: number | null;
  originalPrice: number | null;
  image: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  badge?: string;
  stock?: number | null;
};

type ProductDetailProps = {
  product: Product;
};

export default function ProductDetail({
  product,
}: ProductDetailProps) {
  const { addItem } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [added, setAdded] = useState(false);

  const gallery = Array.from(
    new Set([product.image, ...(product.images ?? [])].filter(Boolean))
  );

  const price = product.price;
  const originalPrice = product.originalPrice;
  const stock = product.stock;

  const canPurchase =
    typeof price === "number" &&
    Number.isFinite(price) &&
    price > 0 &&
    typeof stock === "number" &&
    Number.isInteger(stock) &&
    stock > 0;

  const discount =
    typeof price === "number" &&
    typeof originalPrice === "number" &&
    originalPrice > price &&
    originalPrice > 0
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  const addToBag = () => {
    if (!canPurchase || typeof price !== "number" || stock == null) {
      return;
    }

    const success = addItem(
      {
        id: String(product._id),
        name: product.name,
        image: product.image,
        price,
        stock,
        category: product.category,
      },
      quantity
    );

    setAdded(success);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/products"
        className="mb-8 inline-flex items-center gap-2 text-sm text-gray-600 transition hover:text-[#1d392d]"
      >
        <ArrowLeft size={16} />
        Back to products
      </Link>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:gap-16">
        <section aria-label="Product images">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#efeee8]">
            {product.badge && (
              <span className="absolute left-4 top-4 z-10 rounded-full bg-[#1d392d] px-3 py-1.5 text-xs font-semibold text-white">
                {product.badge}
              </span>
            )}

            <Image
              src={selectedImage}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-8"
            />
          </div>

          {gallery.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto">
              {gallery.map((image) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  aria-label={`View image of ${product.name}`}
                  aria-pressed={selectedImage === image}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-[#efeee8] ${
                    selectedImage === image
                      ? "border-[#1d392d]"
                      : "border-transparent"
                  }`}
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-contain p-2"
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            {product.category}
          </p>

          <h1 className="mt-3 text-3xl font-semibold leading-tight text-[#1d392d] sm:text-4xl">
            {product.name}
          </h1>

          {typeof product.rating === "number" && product.rating > 0 && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Star
                size={15}
                fill="currentColor"
                className="text-amber-500"
              />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-gray-500">
                ({product.reviewCount ?? 0} reviews)
              </span>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {typeof price === "number" && price > 0 ? (
              <span className="text-2xl font-semibold">
                ₹{price.toLocaleString("en-IN")}
              </span>
            ) : (
              <span className="text-base font-medium text-gray-600">
                Price to be confirmed
              </span>
            )}

            {typeof originalPrice === "number" &&
              originalPrice > 0 &&
              typeof price === "number" &&
              originalPrice > price && (
                <span className="text-base text-gray-400 line-through">
                  ₹{originalPrice.toLocaleString("en-IN")}
                </span>
              )}

            {discount !== null && (
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-800">
                {discount}% off
              </span>
            )}
          </div>

          <div className="my-7 border-t border-gray-200" />

          <div>
            <h2 className="text-sm font-semibold">Product description</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">
              {product.description}
            </p>
          </div>

          {product.concern && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold">Intended use</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {product.concern}
              </p>
            </div>
          )}

          {product.ingredients && product.ingredients.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold">Ingredients</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {product.ingredients.join(", ")}
              </p>
            </div>
          )}

          <div className="mt-8 rounded-xl bg-gray-50 p-4">
            {canPurchase ? (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Availability</p>
                  <p className="mt-1 text-sm text-green-700">
                    In stock ({stock} available)
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  Secure checkout
                </span>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                This product is not available for purchase yet. Price and
                stock details must be confirmed.
              </p>
            )}
          </div>

          {canPurchase && (
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-full border border-gray-300">
                <button
                  type="button"
                  onClick={() => {
                    setQuantity((current) => Math.max(1, current - 1));
                    setAdded(false);
                  }}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                  className="p-3 disabled:opacity-30"
                >
                  <Minus size={16} />
                </button>

                <span
                  className="min-w-10 text-center text-sm"
                  aria-live="polite"
                >
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setQuantity((current) =>
                      Math.min(stock ?? 1, current + 1)
                    );
                    setAdded(false);
                  }}
                  disabled={quantity >= (stock ?? 0)}
                  aria-label="Increase quantity"
                  className="p-3 disabled:opacity-30"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                type="button"
                onClick={addToBag}
                disabled={!canPurchase || quantity > (stock ?? 0)}
                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#1d392d] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#294b3b] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {added ? <Check size={18} /> : <ShoppingBag size={18} />}
                {added ? "Added to bag" : "Add to bag"}
              </button>
            </div>
          )}

          <p className="mt-4 text-xs leading-5 text-gray-500">
            Product information and availability are subject to confirmation.
          </p>
        </section>
      </div>
    </main>
  );
}
