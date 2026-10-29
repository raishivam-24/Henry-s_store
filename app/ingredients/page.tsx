import { Suspense } from "react";
import IngredientsPage from "@/components/product/IngredientsPage";

export default function IngredientsRoute() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[50vh] bg-[#fffefa] px-6 py-20 text-center">
          Loading ingredients...
        </main>
      }
    >
      <IngredientsPage />
    </Suspense>
  );
}