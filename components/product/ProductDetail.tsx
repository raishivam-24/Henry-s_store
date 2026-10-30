
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
  MapPin,
  X,
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
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [pincode, setPincode] = useState("");
  const [pincodeMessage, setPincodeMessage] = useState("");

  const gallery = Array.from(
    new Set([product.image, ...(product.images ?? [])].filter(Boolean))
  );

  const currentImage = gallery[selectedImage] || product.image;

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
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null;

  const addToBag = () => {
    if (!canPurchase || quantity > (stock ?? 0)) return;

    const success = addItem(
      {
        id: String(product._id),
        name: product.name,
        image: product.image,
        price: price!,
        stock: stock!,
        category: product.category,
      },
      quantity
    );

    setAdded(success);
  };

  const checkPincode = () => {
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      setPincodeMessage("Please enter a valid 6-digit pincode.");
      return;
    }

    setPincodeMessage("Pincode saved. Delivery availability needs confirmation.");
  };

  const changeImage = (direction: number) => {
    setSelectedImage((current) => {
      return (current + direction + gallery.length) % gallery.length;
    });
  };

  return (
    <main className="min-h-screen bg-[#f5f7f7] pb-28 text-[#202421]">
      {/* Product navigation */}
      <div className="mx-auto max-w-[1440px] px-4 pt-5 sm:px-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-[#207d70]"
        >
          <ArrowLeft size={17} />
          Back to products
        </Link>
      </div>

      {/* Main product section */}
      <section className="mx-auto mt-5 max-w-[1440px] rounded-2xl bg-white p-4 shadow-sm sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8 xl:gap-12">

          {/* LEFT: Image gallery */}
          <div className="min-w-0">
            <div className="group relative aspect-[4/4.4] overflow-hidden rounded-2xl border border-gray-100 bg-[#f8f9fa]">
              {product.badge && (
                <span className="absolute left-0 top-5 z-20 bg-[#ed5147] px-4 py-2 text-xs font-bold text-white shadow-sm">
                  {product.badge}
                </span>
              )}

              {currentImage ? (
                <Image
                  src={currentImage}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain p-5 sm:p-8"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  Product image unavailable
                </div>
              )}

              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => changeImage(-1)}
                    aria-label="Previous product image"
                    className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition hover:bg-white"
                  >
                    <ChevronLeft size={22} />
                  </button>

                  <button
                    type="button"
                    onClick={() => changeImage(1)}
                    aria-label="Next product image"
                    className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition hover:bg-white"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail gallery */}
            {gallery.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {gallery.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    aria-label={`View product image ${index + 1}`}
                    aria-pressed={selectedImage === index}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-[#f8f9fa] transition sm:h-24 sm:w-24 ${
                      selectedImage === index
                        ? "border-[#218477]"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} image ${index + 1}`}
                      fill
                      sizes="96px"
                      className="object-contain p-2"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product information */}
          <div className="flex min-w-0 flex-col">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#218477]">
              {product.category}
            </p>

            <h1 className="mt-3 text-2xl font-bold leading-snug text-[#202421] sm:text-3xl">
              {product.name}
            </h1>

            {/* Rating */}
            {typeof product.rating === "number" && product.rating > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                <Star
                  size={18}
                  fill="#f59e0b"
                  className="text-amber-500"
                />
                <span className="font-semibold">
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-[#218477]">
                  {product.reviewCount ?? 0} Reviews
                </span>
              </div>
            )}

            {/* Product concern */}
            {product.concern && (
              <div className="mt-5 flex flex-wrap gap-2">
                {product.concern
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean)
                  .map((item, index) => (
                    <span
                      key={`${item}-${index}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 sm:text-sm"
                    >
                      <Check size={15} className="text-[#218477]" />
                      {item}
                    </span>
                  ))}
              </div>
            )}

            {/* Price */}
            <div className="mt-7 flex flex-wrap items-center gap-3 border-b border-dashed border-gray-300 pb-6">
              {price !== null && price > 0 ? (
                <span className="text-3xl font-bold">
                  ₹{price.toLocaleString("en-IN")}
                </span>
              ) : (
                <span className="text-lg font-medium text-gray-600">
                  Price to be confirmed
                </span>
              )}

              {originalPrice !== null &&
                originalPrice > 0 &&
                price !== null &&
                originalPrice > price && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      ₹{originalPrice.toLocaleString("en-IN")}
                    </span>

                    {discount !== null && (
                      <span className="text-lg font-bold text-red-500">
                        {discount}% off
                      </span>
                    )}
                  </>
                )}
            </div>

            {/* Stock / availability */}
            <div className="mt-5">
              <p className="text-sm font-semibold text-gray-700">
                Availability
              </p>

              <p className={`mt-2 text-sm ${
                canPurchase ? "text-green-700" : "text-gray-500"
              }`}>
                {canPurchase
                  ? `In stock (${stock} available)`
                  : "Currently unavailable"}
              </p>
            </div>

            {/* Ask about product - visual prompt */}
            <div className="mt-7">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-[11px] font-bold tracking-widest text-gray-700">
                  PRODUCT INFORMATION
                </span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-full border border-gray-300 px-4 py-3">
                <span className="flex-1 truncate text-sm text-gray-400">
                  Explore {product.name}
                </span>
                <ShieldCheck size={19} className="text-[#218477]" />
              </div>
            </div>

            {/* Quantity */}
            {canPurchase && (
              <div className="mt-7">
                <p className="mb-3 text-sm font-semibold">Quantity</p>

                <div className="flex w-fit items-center overflow-hidden rounded-lg border border-gray-300">
                  <button
                    type="button"
                    onClick={() => {
                      setQuantity((current) => Math.max(1, current - 1));
                      setAdded(false);
                    }}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="p-3 transition hover:bg-gray-100 disabled:opacity-30"
                  >
                    <Minus size={16} />
                  </button>

                  <span className="min-w-12 text-center text-sm font-semibold">
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
                    className="p-3 transition hover:bg-gray-100 disabled:opacity-30"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Delivery pincode */}
            <div className="mt-7">
              <h2 className="text-sm font-bold">Check delivery availability</h2>
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
                <MapPin size={20} className="shrink-0 text-gray-500" />
                <input
                  type="text"
                  value={pincode}
                  onChange={(event) => {
                    setPincode(event.target.value.replace(/\D/g, "").slice(0, 6));
                    setPincodeMessage("");
                  }}
                  placeholder="Enter your pincode"
                  maxLength={6}
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={checkPincode}
                  className="text-sm font-bold text-[#218477] hover:text-[#17665c]"
                >
                  Check
                </button>
              </div>
              {pincodeMessage && (
                <p className="mt-2 text-xs text-gray-500">
                  {pincodeMessage}
                </p>
              )}
            </div>

            {/* Delivery benefits */}
            <div className="mt-6 grid grid-cols-2 gap-4 border-y border-gray-100 py-5">
              <div className="flex items-center gap-3">
                <RotateCcw size={22} className="shrink-0 text-gray-500" />
                <div>
                  <p className="text-xs font-semibold">Easy returns</p>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Subject to store policy
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Truck size={23} className="shrink-0 text-gray-500" />
                <div>
                  <p className="text-xs font-semibold">Delivery</p>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Availability confirmation required
                  </p>
                </div>
              </div>
            </div>

            {/* Add to cart */}
            <button
              type="button"
              onClick={addToBag}
              disabled={!canPurchase || quantity > (stock ?? 0)}
              className="mt-6 flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#218477] px-6 py-4 text-base font-bold text-white transition hover:bg-[#176d62] disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {added ? <Check size={21} /> : <ShoppingBag size={21} />}
              {added ? "Added to cart" : canPurchase ? "Add to cart" : "Currently unavailable"}
            </button>
          </div>
        </div>
      </section>

      {/* Product details below */}
      <section className="mx-auto mt-7 max-w-[1440px] space-y-3 px-4 sm:px-8">
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="flex flex-wrap gap-2 border-b border-gray-100 px-4 py-4 sm:px-7">
            {[
              { id: "description", label: "Description" },
              { id: "ingredients", label: "Key Ingredients" },
              { id: "concern", label: "Product Details" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-[#218477] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="px-5 py-6 sm:px-8 sm:py-8">
            {activeTab === "description" && (
              <>
                <h2 className="text-xl font-bold">Description</h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-8 text-gray-600">
                  {product.description || "No description available."}
                </p>
              </>
            )}

            {activeTab === "ingredients" && (
              <>
                <h2 className="text-xl font-bold">Key Ingredients</h2>
                {product.ingredients && product.ingredients.length > 0 ? (
                  <div className="mt-5 flex flex-wrap gap-3">
                    {product.ingredients.map((ingredient, index) => (
                      <span
                        key={`${ingredient}-${index}`}
                        className="rounded-full border border-[#d7eae6] bg-[#f0f8f6] px-4 py-2 text-sm text-[#28796e]"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">
                    Ingredient information is not available.
                  </p>
                )}
              </>
            )}

            {activeTab === "concern" && (
              <>
                <h2 className="text-xl font-bold">Product Details</h2>
                <div className="mt-5 space-y-4 text-sm text-gray-600">
                  <p>
                    <span className="font-semibold text-gray-800">Product:</span>{" "}
                    {product.name}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-800">Category:</span>{" "}
                    {product.category}
                  </p>
                  {product.concern && (
                    <p>
                      <span className="font-semibold text-gray-800">Concern:</span>{" "}
                      {product.concern}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Sticky bottom purchase bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 shadow-[0_-5px_25px_rgba(0,0,0,0.06)] backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative hidden h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-50 sm:block">
              {product.image && (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="56px"
                  className="object-contain p-1"
                />
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {product.name}
              </p>
              <div className="mt-1 flex items-center gap-2">
                {price !== null && price > 0 && (
                  <span className="text-base font-bold">
                    ₹{price.toLocaleString("en-IN")}
                  </span>
                )}
                {originalPrice !== null &&
                  originalPrice > 0 &&
                  price !== null &&
                  originalPrice > price && (
                    <span className="text-xs text-gray-400 line-through">
                      ₹{originalPrice.toLocaleString("en-IN")}
                    </span>
                  )}
                {discount !== null && (
                  <span className="text-sm font-bold text-red-500">
                    {discount}% off
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={addToBag}
            disabled={!canPurchase || quantity > (stock ?? 0)}
            className="flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#218477] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#176d62] disabled:bg-gray-400 sm:min-w-52 sm:px-9 sm:text-base"
          >
            {added ? <Check size={18} /> : <ShoppingBag size={18} />}
            {added ? "Added" : "Add to cart"}
          </button>
        </div>
      </div>
    </main>
  );
}
