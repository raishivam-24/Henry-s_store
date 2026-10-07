import Image from "next/image";
import Link from "next/link";
import { Star, ArrowLeft } from "lucide-react";
import { products } from "@/lib/products";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return products.map((product) => ({
    id: String(product.id),
  }));
}

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;

  const product = products.find(
    (item) => item.id === Number(id)
  );

  if (!product) {
    notFound();
  }

  const discount = Math.round(
    ((product.originalPrice - product.price) /
      product.originalPrice) *
      100
  );

  return (
    <main className="min-h-screen bg-[#f8f7f3]">

      {/* Back */}
      <div className="mx-auto max-w-[1400px] px-5 py-6 sm:px-10 lg:px-16">
        <Link
          href="/products"
          className="flex w-fit items-center gap-2 text-sm text-gray-500 transition hover:text-black"
        >
          <ArrowLeft size={16} />
          Back to products
        </Link>
      </div>

      {/* Product */}
      <section className="mx-auto max-w-[1400px] px-5 pb-20 sm:px-10 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-20">

          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-[#eeede7]">

            {product.badge && (
              <span className="absolute left-6 top-6 z-10 rounded-full bg-[#1d392d] px-4 py-2 text-[10px] font-semibold tracking-widest text-white">
                {product.badge}
              </span>
            )}

            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-10 sm:p-20"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">

            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
              {product.category}
            </p>

            <h1 className="mt-4 text-4xl font-medium tracking-[-0.04em] sm:text-5xl">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="mt-5 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star
                  size={15}
                  fill="currentColor"
                  strokeWidth={1.5}
                />

                <span className="text-sm">
                  {product.rating}
                </span>
              </div>

              <span className="text-sm text-gray-400">
                ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <span className="text-2xl font-semibold">
                ₹{product.price}
              </span>

              <span className="text-base text-gray-400 line-through">
                ₹{product.originalPrice}
              </span>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                {discount}% OFF
              </span>
            </div>

            <div className="my-8 h-px bg-[#deddd6]" />

            {/* Description */}
            <p className="text-sm leading-7 text-gray-600">
              A thoughtfully selected Henry&apos;s Store essential
              designed to fit seamlessly into your everyday routine.
            </p>

            {/* Buttons */}
            <div className="mt-8">
              <button
                type="button"
                className="w-full rounded-full bg-[#1d392d] py-4 text-sm font-medium text-white transition hover:bg-[#13281f]"
              >
                Add to Bag
              </button>

              <button
                type="button"
                className="mt-3 w-full rounded-full border border-[#1d392d] py-4 text-sm font-medium transition hover:bg-[#1d392d] hover:text-white"
              >
                Buy Now
              </button>
            </div>

            {/* Information */}
            <div className="mt-10 space-y-5 border-t border-[#deddd6] pt-6">

              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400">
                  Concern
                </p>

                <p className="mt-2 text-sm">
                  {product.concern}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400">
                  Delivery
                </p>

                <p className="mt-2 text-sm">
                  Cash on Delivery available
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400">
                  Returns
                </p>

                <p className="mt-2 text-sm">
                  Easy returns on eligible products
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}