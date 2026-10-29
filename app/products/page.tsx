
import { Suspense } from "react";
import ProductsPage from "@/components/product/ProductsPage";

export default function Products() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#fffefa] px-6 py-16">
          <div className="mx-auto max-w-7xl animate-pulse">
            <div className="mb-8 h-8 w-48 rounded bg-gray-200" />
            <div className="h-5 w-72 rounded bg-gray-100" />
          </div>
        </main>
      }
    >
      <ProductsPage />
    </Suspense>
  );
}
