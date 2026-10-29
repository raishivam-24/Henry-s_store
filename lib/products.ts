
export type Product = {
  id: string | number;
  name: string;
  category: string;
  concern: string;
  description?: string;
  ingredients: string | string[];
  price: number | null;
  originalPrice: number | null;
  image: string;
  rating: number;
  reviews: number;
  badge?: string;
  stock?: number | null;
};

export type ApiProduct = {
  _id: string;
  name: string;
  category?: string;
  description?: string;
  concern?: string;
  ingredients?: string | string[];
  price: number | null;
  originalPrice: number | null;
  image: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  badge?: string;
  stock?: number | null;
  isActive?: boolean;
};

export async function getProducts(): Promise<Product[]> {
  const response = await fetch("/api/products", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const data: {
    success: boolean;
    products: ApiProduct[];
  } = await response.json();

  if (!data.success || !Array.isArray(data.products)) {
    throw new Error("Products API returned an invalid response");
  }

  return data.products.map((item) => ({
    id: item._id,
    name: item.name,
    category: item.category ?? "Skincare",
    concern: item.concern ?? "",
    ingredients: item.ingredients ?? "",
    price: item.price,
    originalPrice: item.originalPrice,
    image: item.image || item.images?.[0] || "",
    rating: item.rating ?? 0,
    reviews: item.reviewCount ?? 0,
    badge: item.badge || undefined,
    stock: item.stock ?? null,
  }));
}
