import ProductCard from "@/components/product/ProductCard";
import { products } from "@/lib/products";

export default function Bestsellers() {
  const bestsellers = products.filter(
    (product) => product.badge === "BESTSELLER"
  );

  return (
    <section
      id="bestsellers"
      className="bg-[#f8f7f3] px-5 py-20 sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-[1400px]">

        <div className="mb-10 flex items-end justify-between">

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
              Loved by our community
            </p>

            <h2 className="mt-3 text-4xl font-medium tracking-[-0.04em] sm:text-5xl">
              Bestsellers
            </h2>
          </div>

         <a href="/products">
  View all products
</a>

        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {bestsellers.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

      </div>
    </section>
  );
}