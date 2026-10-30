
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import ProductDetail from "@/components/product/ProductDetail";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

type ApiProduct = {
  _id: string;
  name: string;
  slug: string;
  category: string;
  concern?: string;
  description: string;
  ingredients?: string[];
  price: number | null;
  originalPrice: number | null;
  image: string;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  badge?: string;
  stock?: number | null;
};

async function getProduct(id: string): Promise<ApiProduct | null> {
  await connectDB();

  const conditions: Record<string, unknown>[] = [
    { slug: id.toLowerCase() },
  ];

  if (mongoose.Types.ObjectId.isValid(id)) {
    conditions.push({ _id: id });
  }

  const product = await Product.findOne({
    isActive: true,
    $or: conditions,
  }).lean();

  if (!product) return null;

  return {
    _id: String(product._id),
    name: product.name,
    slug: product.slug,
    category: product.category,
    concern: product.concern,
    description: product.description,
    ingredients: product.ingredients,
    price: product.price,
    originalPrice: product.originalPrice,
    image: product.image,
    images: product.images,
    rating: product.rating,
    reviewCount: product.reviewCount,
    badge: product.badge,
    stock: product.stock ?? null,
  };
}

export default async function ProductDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
