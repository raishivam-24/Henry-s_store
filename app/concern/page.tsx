import { Suspense } from "react";
import ConcernPage from "@/components/product/ConcernPage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#faf9f6] p-8">
          Loading skin concerns...
        </main>
      }
    >
      <ConcernPage />
    </Suspense>
  );
}