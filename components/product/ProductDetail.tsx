
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, type CartItem } from "@/context/CartContext";
import ReviewSection from "@/components/product/ReviewSection";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Heart,
  Package,
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

type StoreProduct = Product;

const faqs = [
  {
    question: "How do I use this product?",
    answer:
      "Please follow the usage instructions provided on the product packaging. If specific instructions are not available, contact our support team before use.",
  },
  {
    question: "Is this product suitable for all skin types?",
    answer:
      "Suitability depends on the product's ingredients and your skin type. Review the ingredient list and perform a patch test before regular use.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Orders are generally processed within 1–2 business days. Delivery time depends on your delivery location and the shipping service.",
  },
  {
    question: "Can I return this product?",
    answer:
      "Returns are subject to Henry's Store return and refund policy. Please check the policy before placing your order.",
  },
];

function formatPrice(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function ProductCard({ item }: { item: StoreProduct }) {
  const itemPrice = item.price;
  const itemImage = item.images?.[0] || item.image;

  return (
    <article className="group min-w-0">
      <Link
        href={`/products/${item.slug || item._id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#f1f0ea]">
          {item.badge && (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-[#1d392d] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-white">
              {item.badge}
            </span>
          )}

          {itemImage && (
            <Image
              src={itemImage}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-contain p-5 transition-transform duration-500 group-hover:scale-105 sm:p-7"
            />
          )}
        </div>
      </Link>

      <div className="pt-3">
        <p className="text-[10px] font-medium uppercase tracking-widest text-gray-500">
          {item.category}
        </p>

        <Link
          href={`/products/${item.slug || item._id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-[#1d392d] transition hover:underline">
            {item.name}
          </h3>
        </Link>

        {typeof item.rating === "number" && item.rating > 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-600">
            <Star
              size={12}
              fill="currentColor"
              className="text-amber-500"
            />
            {item.rating.toFixed(1)}
            <span className="text-gray-400">
              ({item.reviewCount ?? 0})
            </span>
          </div>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {typeof itemPrice === "number" && itemPrice > 0 ? (
            <span className="text-sm font-semibold text-gray-900">
              {formatPrice(itemPrice)}
            </span>
          ) : (
            <span className="text-xs text-gray-500">
              Price unavailable
            </span>
          )}

          {typeof item.originalPrice === "number" &&
            typeof itemPrice === "number" &&
            item.originalPrice > itemPrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(item.originalPrice)}
              </span>
            )}
        </div>
      </div>
    </article>
  );
}

export default function ProductDetail({
  product,
}: ProductDetailProps) {
  const router = useRouter();
  const { addItem } = useCart();

  const [imageSelection, setImageSelection] = useState({
    productId: product._id,
    image: product.image,
  });

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [relatedProducts, setRelatedProducts] = useState<StoreProduct[]>([]);
  const [recentProducts, setRecentProducts] = useState<StoreProduct[]>([]);
  const [wishlist, setWishlist] = useState(false);
  const [notice, setNotice] = useState("");

  // Reset the selected image automatically when the product changes.
  const selectedImage =
    imageSelection.productId === product._id
      ? imageSelection.image
      : product.image;

  const gallery = useMemo(
    () =>
      Array.from(
        new Set([product.image, ...(product.images ?? [])].filter(Boolean))
      ),
    [product.image, product.images]
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

  // Save the pending item for guests in the same format
  // used by ProductCard and CartContext.
  function saveGuestCartItem(item: Omit<CartItem, "quantity">, count: number) {
    const GUEST_CART_KEY = "henrys-store-guest-cart";

    try {
      const stored = localStorage.getItem(GUEST_CART_KEY);
      const guestCart: CartItem[] = stored ? JSON.parse(stored) : [];

      const existingItem = guestCart.find(
        (cartItem) => cartItem.id === item.id
      );

      if (existingItem) {
        existingItem.quantity = Math.min(
          existingItem.quantity + count,
          item.stock
        );
        existingItem.stock = item.stock;
      } else {
        guestCart.push({
          ...item,
          quantity: Math.min(count, item.stock),
        });
      }

      localStorage.setItem(
        GUEST_CART_KEY,
        JSON.stringify(guestCart)
      );

      return true;
    } catch (error) {
      console.error("Could not save guest cart:", error);
      return false;
    }
  }

  // Load related products and recently viewed products.
  useEffect(() => {
    let cancelled = false;

    async function loadRecommendations() {
      try {
        const response = await fetch("/api/products", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        const products: StoreProduct[] = Array.isArray(data.products)
          ? data.products
          : [];

        if (cancelled) return;

        const others = products.filter(
          (item) => item._id !== product._id
        );

        const related = others
          .filter(
            (item) =>
              item.category?.toLowerCase() ===
                product.category?.toLowerCase() ||
              (!!product.concern &&
                item.concern?.toLowerCase() ===
                  product.concern.toLowerCase())
          )
          .slice(0, 8);

        setRelatedProducts(related);

        // Keep the current product at the beginning of recently viewed.
        const stored = localStorage.getItem("henrys-recently-viewed");

        const previous: StoreProduct[] = stored
          ? JSON.parse(stored)
          : [];

        const updated = [
          product,
          ...previous.filter((item) => item._id !== product._id),
        ].slice(0, 8);

        localStorage.setItem(
          "henrys-recently-viewed",
          JSON.stringify(updated)
        );

        if (!cancelled) {
          setRecentProducts(
            updated.filter((item) => item._id !== product._id)
          );
        }
      } catch (error) {
        console.error("Could not load product recommendations:", error);
      }
    }

    loadRecommendations();

    return () => {
      cancelled = true;
    };
  }, [product]);

  // Add to bag for both guests and authenticated customers.
  async function addToBag() {
    if (!canPurchase || typeof stock !== "number" || price === null) {
      setNotice("This product is currently unavailable.");
      return;
    }

    if (quantity > stock) {
      setNotice(`Only ${stock} items are currently available.`);
      return;
    }

    if (adding) return;

    setAdding(true);
    setAdded(false);
    setNotice("");

    const item: Omit<CartItem, "quantity"> = {
      id: String(product._id),
      name: product.name,
      image: product.image,
      price,
      stock,
      category: product.category,
    };

    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      // Guest user: preserve the selected product and quantity.
      if (response.status === 401) {
        const saved = saveGuestCartItem(item, quantity);

        if (!saved) {
          setNotice("Could not save your bag. Please try again.");
          return;
        }

        const returnUrl =
          window.location.pathname + window.location.search;

        router.push(
          `/login?redirectTo=${encodeURIComponent(returnUrl)}`
        );

        return;
      }

      if (!response.ok) {
        throw new Error("Unable to verify your login status.");
      }

      const data = await response.json();

      if (!data.user) {
        throw new Error("User session could not be verified.");
      }

      const success = addItem(item, quantity);

      setAdded(success);

      setNotice(
        success
          ? `${product.name} added to your bag.`
          : "Could not add this item. Please check your available stock."
      );
    } catch (error) {
      console.error("Add to bag failed:", error);
      setNotice("Something went wrong. Please try again.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <main className="min-h-screen bg-white pb-20">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-7 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-[#1d392d]">
            Home
          </Link>

          <ChevronRight size={13} />

          <Link href="/products" className="hover:text-[#1d392d]">
            Products
          </Link>

          <ChevronRight size={13} />

          <span className="font-medium text-[#1d392d]">
            {product.name}
          </span>
        </nav>

        {/* Main product section */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 lg:gap-20">
          {/* Product image gallery */}
          <section aria-label="Product images" className="min-w-0">
            <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 sm:grid-cols-[84px_minmax(0,1fr)] sm:gap-4">
              {gallery.length > 1 && (
                <div className="flex max-h-[600px] flex-col gap-3 overflow-y-auto">
                  {gallery.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() =>
                        setImageSelection({
                          productId: product._id,
                          image,
                        })
                      }
                      aria-label={`View product image ${index + 1}`}
                      aria-pressed={selectedImage === image}
                      className={`relative aspect-square w-full shrink-0 overflow-hidden rounded-xl border-2 bg-[#f1f0ea] transition ${
                        selectedImage === image
                          ? "border-[#1d392d]"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} image ${index + 1}`}
                        fill
                        sizes="84px"
                        className="object-contain p-2"
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#f1f0ea]">
                {product.badge && (
                  <span className="absolute left-4 top-4 z-10 rounded-full bg-[#1d392d] px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-white">
                    {product.badge}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setWishlist((current) => !current)}
                  aria-label={
                    wishlist ? "Remove from wishlist" : "Add to wishlist"
                  }
                  aria-pressed={wishlist}
                  className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition hover:scale-105"
                >
                  <Heart
                    size={19}
                    className={
                      wishlist
                        ? "fill-red-500 text-red-500"
                        : "text-gray-700"
                    }
                  />
                </button>

                {selectedImage && (
                  <Image
                    src={selectedImage}
                    alt={product.name}
                    fill
                    priority
                    sizes="(max-width: 768px) 85vw, 50vw"
                    className="object-contain p-8 sm:p-12"
                  />
                )}
              </div>
            </div>

            <p className="mt-3 text-center text-xs text-gray-400">
              Product images may vary slightly from the actual packaging.
            </p>
          </section>

          {/* Product information */}
          <section className="flex min-w-0 flex-col">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
              {product.category}
            </p>

            <h1 className="mt-3 text-3xl font-semibold leading-tight text-[#1d392d] sm:text-4xl lg:text-[42px]">
              {product.name}
            </h1>

            {product.concern && (
              <p className="mt-3 text-sm leading-6 text-gray-600">
                {product.concern}
              </p>
            )}

            {/* Rating */}
            <a
              href="#reviews"
              className="mt-5 flex w-fit items-center gap-2 text-sm transition hover:opacity-70"
            >
              <span className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={15}
                    fill={
                      index < Math.round(product.rating ?? 0)
                        ? "currentColor"
                        : "none"
                    }
                  />
                ))}
              </span>

              <span className="font-semibold text-gray-800">
                {(product.rating ?? 0).toFixed(1)}
              </span>

              <span className="text-gray-500 underline underline-offset-2">
                {product.reviewCount ?? 0} reviews
              </span>
            </a>

            {/* Price */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {typeof price === "number" && price > 0 ? (
                <span className="text-3xl font-semibold text-[#1d392d]">
                  {formatPrice(price)}
                </span>
              ) : (
                <span className="text-base text-gray-500">
                  Price to be confirmed
                </span>
              )}

              {typeof originalPrice === "number" &&
                originalPrice > 0 &&
                typeof price === "number" &&
                originalPrice > price && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}

              {discount !== null && (
                <span className="rounded-full bg-[#e8f0e9] px-3 py-1.5 text-xs font-semibold text-[#1d392d]">
                  {discount}% OFF
                </span>
              )}
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Inclusive of applicable taxes
            </p>

            <div className="my-7 border-t border-gray-200" />

            {/* Short description */}
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                About this product
              </h2>

              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">
                {product.description}
              </p>
            </div>

            {/* Stock status */}
            <div className="mt-7 rounded-xl bg-[#f7f8f5] p-4">
              {canPurchase ? (
                <div className="flex items-center gap-3">
                  <Check size={19} className="text-green-700" />

                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      In stock
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {stock} units available
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Package size={19} className="text-gray-500" />

                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Currently unavailable
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      This product cannot currently be added to your bag.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quantity and cart */}
            {canPurchase && (
              <div className="mt-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Quantity
                </p>

                <div className="flex flex-wrap gap-3">
                  <div className="flex h-12 items-center rounded-full border border-gray-300">
                    <button
                      type="button"
                      onClick={() => {
                        setQuantity((current) => Math.max(1, current - 1));
                        setAdded(false);
                        setNotice("");
                      }}
                      disabled={quantity <= 1 || adding}
                      aria-label="Decrease quantity"
                      className="px-4 text-gray-700 disabled:opacity-30"
                    >
                      <Minus size={15} />
                    </button>

                    <span className="min-w-8 text-center text-sm font-medium">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setQuantity((current) =>
                          Math.min(stock ?? 1, current + 1)
                        );
                        setAdded(false);
                        setNotice("");
                      }}
                      disabled={quantity >= (stock ?? 0) || adding}
                      aria-label="Increase quantity"
                      className="px-4 text-gray-700 disabled:opacity-30"
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={addToBag}
                    disabled={adding}
                    className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#1d392d] px-6 text-sm font-semibold text-white transition hover:bg-[#294b3b] disabled:cursor-wait disabled:opacity-70"
                  >
                    {adding ? (
                      <span className="animate-pulse">Please wait...</span>
                    ) : added ? (
                      <>
                        <Check size={18} />
                        Added to bag
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={18} />
                        Add to bag
                      </>
                    )}
                  </button>
                </div>

                {notice && (
                  <p
                    role="status"
                    className={`mt-3 text-sm ${
                      added ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    {notice}
                  </p>
                )}
              </div>
            )}

            {/* Service highlights */}
            <div className="mt-8 grid grid-cols-3 gap-3 border-y border-gray-200 py-5">
              <div className="flex flex-col items-center gap-2 text-center">
                <Truck size={21} className="text-[#1d392d]" />

                <span className="text-[10px] leading-4 text-gray-600 sm:text-xs">
                  Delivery
                  <br />
                  information
                </span>
              </div>

              <div className="flex flex-col items-center gap-2 text-center">
                <ShieldCheck size={21} className="text-[#1d392d]" />

                <span className="text-[10px] leading-4 text-gray-600 sm:text-xs">
                  Secure
                  <br />
                  checkout
                </span>
              </div>

              <div className="flex flex-col items-center gap-2 text-center">
                <RotateCcw size={21} className="text-[#1d392d]" />

                <span className="text-[10px] leading-4 text-gray-600 sm:text-xs">
                  Store return
                  <br />
                  policy
                </span>
              </div>
            </div>

            <Link
              href="/products"
              className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-medium text-[#1d392d] hover:underline"
            >
              <ArrowLeft size={15} />
              Continue shopping
            </Link>
          </section>
        </div>

        {/* Product information tabs */}
        <section className="mt-20 border-t border-gray-200 pt-10">
          <div className="flex flex-wrap gap-7 border-b border-gray-200">
            {[
              { id: "description", label: "Description" },
              { id: "ingredients", label: "Ingredients" },
              { id: "information", label: "Product information" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative pb-4 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "text-[#1d392d]"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {tab.label}

                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#1d392d]" />
                )}
              </button>
            ))}
          </div>

          <div className="max-w-4xl py-7">
            {activeTab === "description" && (
              <div>
                <h2 className="text-lg font-semibold text-[#1d392d]">
                  Product description
                </h2>

                <p className="mt-4 whitespace-pre-line text-sm leading-8 text-gray-600">
                  {product.description}
                </p>

                {product.concern && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Product concern
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-gray-600">
                      {product.concern}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "ingredients" && (
              <div>
                <h2 className="text-lg font-semibold text-[#1d392d]">
                  Ingredients
                </h2>

                {product.ingredients && product.ingredients.length > 0 ? (
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {product.ingredients.map((ingredient, index) => (
                      <li
                        key={`${ingredient}-${index}`}
                        className="flex items-center gap-3 rounded-lg bg-[#f7f8f5] p-3 text-sm text-gray-700"
                      >
                        <Check size={15} className="text-green-700" />
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">
                    Ingredient information has not been added yet.
                  </p>
                )}
              </div>
            )}

            {activeTab === "information" && (
              <div>
                <h2 className="text-lg font-semibold text-[#1d392d]">
                  Product information
                </h2>

                <div className="mt-4 divide-y divide-gray-200">
                  <div className="flex justify-between gap-4 py-4 text-sm">
                    <span className="text-gray-500">Product</span>
                    <span className="text-right font-medium text-gray-800">
                      {product.name}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 py-4 text-sm">
                    <span className="text-gray-500">Category</span>
                    <span className="text-right font-medium text-gray-800">
                      {product.category}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 py-4 text-sm">
                    <span className="text-gray-500">Concern</span>
                    <span className="text-right font-medium text-gray-800">
                      {product.concern || "Not specified"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 py-4 text-sm">
                    <span className="text-gray-500">Availability</span>
                    <span className="text-right font-medium text-gray-800">
                      {canPurchase ? "In stock" : "Unavailable"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Customer reviews */}
        <ReviewSection productId={product.slug || product._id} />

        {/* FAQs */}
        <section className="mt-16 border-t border-gray-200 pt-12">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              Need to know
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-[#1d392d] sm:text-3xl">
              Frequently asked questions
            </h2>

            <div className="mt-7 divide-y divide-gray-200 border-y border-gray-200">
              {faqs.map((faq, index) => (
                <div key={faq.question}>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaq(openFaq === index ? null : index)
                    }
                    aria-expanded={openFaq === index}
                    className="flex w-full items-center justify-between gap-5 py-5 text-left"
                  >
                    <span className="text-sm font-semibold text-gray-800">
                      {faq.question}
                    </span>

                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-gray-500 transition-transform ${
                        openFaq === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {openFaq === index && (
                    <p className="max-w-2xl pb-5 pr-8 text-sm leading-7 text-gray-600">
                      {faq.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 border-t border-gray-200 pt-12">
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  You may also like
                </p>

                <h2 className="mt-2 text-2xl font-semibold text-[#1d392d] sm:text-3xl">
                  Related products
                </h2>
              </div>

              <Link
                href="/products"
                className="hidden items-center gap-1 text-sm font-semibold text-[#1d392d] hover:underline sm:flex"
              >
                View all <ChevronRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
              {relatedProducts.slice(0, 4).map((item) => (
                <ProductCard key={item._id} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* Recently viewed */}
        {recentProducts.length > 0 && (
          <section className="mt-20 border-t border-gray-200 pt-12">
            <div className="mb-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                Your browsing history
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-[#1d392d] sm:text-3xl">
                Recently viewed
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
              {recentProducts.slice(0, 4).map((item) => (
                <ProductCard key={item._id} item={item} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile sticky purchase bar */}
      {canPurchase && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 p-3 shadow-[0_-5px_20px_rgba(0,0,0,0.06)] backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-gray-600">
                {product.name}
              </p>

              <p className="mt-1 text-base font-semibold text-[#1d392d]">
                {formatPrice(price!)}
              </p>
            </div>

            <button
              type="button"
              onClick={addToBag}
              disabled={adding}
              className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#1d392d] px-6 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-70"
            >
              {adding ? (
                "Please wait..."
              ) : added ? (
                <>
                  <Check size={17} />
                  Added
                </>
              ) : (
                <>
                  <ShoppingBag size={17} />
                  Add to bag
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
