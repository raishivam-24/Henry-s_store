
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

type StoreProduct = {
  _id: string;
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  images?: string[];
  price?: number | null;
  originalPrice?: number | null;
  stock?: number | null;
  category?: string;
  packSize?: string;
  isActive?: boolean;
};

export default function Bestsellers() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const { addItem } = useCart();

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Products could not be loaded.");

        const data = await response.json();
        const list: StoreProduct[] = Array.isArray(data.products)
          ? data.products
          : [];

        if (!cancelled) {
          setProducts(list);
        }
      } catch {
        if (!cancelled) {
          setMessage("Products could not be loaded. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  function scrollCarousel(direction: "left" | "right") {
    document
      .getElementById("henrys-bestsellers-carousel")
      ?.scrollBy({
        left: direction === "left" ? -700 : 700,
        behavior: "smooth",
      });
  }

  function getImage(product: StoreProduct) {
    return product.images?.[0] || product.image || "";
  }

  function addToBag(product: StoreProduct) {
    const price = Number(product.price);
    const stock = Number(product.stock);
    const image = getImage(product);

    if (!product._id || !Number.isFinite(price) || price <= 0 ||
        !Number.isInteger(stock) || stock <= 0 || !image) {
      setMessage("This product is not currently available to purchase.");
      return;
    }

    const added = addItem(
      {
        id: product._id,
        name: product.name,
        image,
        price,
        stock,
        category: product.category || "Skincare",
      },
      1
    );

    setMessage(
      added
        ? `${product.name} added to your bag.`
        : "Could not add this item. Check its available stock."
    );
  }

  return (
    <section className="bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-7 text-center">
          <h2 className="text-3xl font-medium tracking-tight text-[#171714] sm:text-4xl">
            Our <span className="font-bold">Bestsellers</span>
          </h2>
          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            Discover skincare essentials for your everyday routine
          </p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => scrollCarousel("left")}
            aria-label="Previous products"
            className="absolute -left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg sm:-left-4 sm:h-12 sm:w-12"
          >
            <ArrowLeft size={19} />
          </button>

          <div
            id="henrys-bestsellers-carousel"
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {loading && (
              <p className="w-full py-12 text-center text-sm text-gray-500">
                Loading products...
              </p>
            )}

            {!loading && !products.length && !message && (
              <p className="w-full py-12 text-center text-sm text-gray-500">
                No products are available right now.
              </p>
            )}

            {products.map((product) => {
              const image = getImage(product);
              const price = Number(product.price);
              const mrp = Number(product.originalPrice);
              const hasPrice = Number.isFinite(price) && price > 0;
              const hasMrp =
                hasPrice && Number.isFinite(mrp) && mrp > price;
              const stock = Number(product.stock);
              const inStock =
                Number.isInteger(stock) && stock > 0;
              const discount = hasMrp
                ? Math.round(((mrp - price) / mrp) * 100)
                : 0;

              return (
                <article
                  key={product._id}
                  className="flex w-[260px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-[#e7e7e3] bg-white transition hover:shadow-lg sm:w-[310px] lg:w-[340px]"
                >
                  <div className="relative bg-[#f8f7f3] p-3">
                    {hasMrp && (
                      <span className="absolute left-0 top-3 z-10 bg-[#f04c43] px-3 py-1 text-[11px] font-bold text-white">
                        SAVE {discount}%
                      </span>
                    )}

                    <Link
                      href={`/products/${product.slug || product._id}`}
                      className="flex h-[230px] items-center justify-center sm:h-[260px]"
                    >
                      {image ? (
                        <div
                          role="img"
                          aria-label={product.name}
                          className="h-full w-full bg-contain bg-center bg-no-repeat transition duration-300 hover:scale-[1.03]"
                          style={{ backgroundImage: `url("${image}")` }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                          Product image unavailable
                        </div>
                      )}
                    </Link>

                    <div className="mt-2 rounded-lg bg-white/90 px-3 py-2 text-center text-xs text-gray-600">
                      Everyday skincare essentials
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <span className="mb-2 w-fit rounded bg-[#d9f3ed] px-2 py-1 text-[10px] font-medium text-[#15594b]">
                      {product.category || "Skincare"}
                    </span>

                    <Link
                      href={`/products/${product.slug || product._id}`}
                      className="line-clamp-2 min-h-11 text-sm font-semibold leading-5 text-[#171714] hover:text-[#237d70]"
                    >
                      {product.name}
                    </Link>

                    <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-gray-600">
                      {product.description || "Explore this skincare essential for your daily routine."}
                    </p>

                    <div className="mt-4 flex min-h-8 flex-wrap items-center gap-2">
                      {hasPrice ? (
                        <>
                          <span className="text-lg font-bold text-[#171714]">
                            ₹{price.toLocaleString("en-IN")}
                          </span>

                          {hasMrp && (
                            <>
                              <span className="text-xs text-gray-500 line-through">
                                ₹{mrp.toLocaleString("en-IN")}
                              </span>
                              <span className="text-xs font-semibold text-red-500">
                                {discount}% OFF
                              </span>
                            </>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">
                          Price unavailable
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => addToBag(product)}
                      disabled={!hasPrice || !inStock || !image}
                      className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#237d70] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#185e52] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
                    >
                      <ShoppingBag size={17} />
                      {!hasPrice
                        ? "Price unavailable"
                        : !inStock
                          ? "Notify when available"
                          : "Add to Cart"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scrollCarousel("right")}
            aria-label="Next products"
            className="absolute -right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg sm:-right-4 sm:h-12 sm:w-12"
          >
            <ArrowRight size={19} />
          </button>
        </div>

        {message && (
          <p role="status" className="mt-4 text-center text-sm text-[#237d70]">
            {message}
          </p>
        )}

        <div className="mt-7 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-lg bg-[#f3f5f4] px-6 py-3 text-sm font-semibold text-[#203b31] transition hover:bg-[#e6eeea]"
          >
            View All Products <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
