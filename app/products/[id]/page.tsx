
import { Suspense } from "react";
import ProductDetailContent from "./ProductDetailContent";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="container mx-auto px-4 py-16">
          <p className="text-center text-gray-500">
            Loading product details...
          </p>
        </main>
      }
    >
      <ProductDetailContent params={params} />
    </Suspense>
  );
}
