export type Product = {
  id: string | number;
  name: string;
  category: string;
  concern: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  reviews: number;
  badge?: string;
};

type ApiProduct = {
  _id: string;
  name: string;
  category: string;
  concern?: string;
  price: number | null;
  originalPrice: number | null;
  image: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
};

export async function getProducts(): Promise<Product[]> {
  const response = await fetch("/api/products");

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const data: { success: boolean; products: ApiProduct[] } =
    await response.json();

  if (!data.success) {
    throw new Error("Products API returned an error");
  }

  return data.products
    .filter(
      (product) =>
        typeof product.price === "number" &&
        product.price > 0
    )
    .map((product) => ({
      id: product._id,
      name: product.name,
      category: product.category,
      concern: product.concern ?? "",
      price: product.price as number,
      originalPrice: product.originalPrice ?? product.price as number,
      image: product.image,
      rating: product.rating ?? 0,
      reviews: product.reviewCount ?? 0,
      badge: product.badge || undefined,
    }));
}
