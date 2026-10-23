
import { notFound } from "next/navigation";
import ProductDetail from "@/components/product/ProductDetail";

type ApiProduct = {
  _id: string;
  name: string;
  category: string;
  concern?: string;
  description: string;
  price: number | null;
  originalPrice: number | null;
  image: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  badge?: string;
};

async function getProduct(id: string): Promise<ApiProduct | null> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const response = await fetch(
      `${baseUrl}/api/products/${encodeURIComponent(id)}`,
      { cache: "no-store" }
    );

    if (response.status === 404) return null;
    if (!response.ok) throw new Error("Failed to fetch product");

    const data = await response.json();
    return data.product ?? null;
  } catch (error) {
    console.error("Product detail fetch failed:", error);
    return null;
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  return <ProductDetail product={product} />;
}
