
import { Suspense } from "react";
import CategoryPage from "@/components/product/CategoryPage";

export default function CategoryRoute() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[50vh] bg-[#fffefa] px-6 py-20 text-center">
          Loading categories...
        </main>
      }
    >
      <CategoryPage />
    </Suspense>
  );
}
