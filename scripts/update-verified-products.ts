
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product";

dotenv.config({ path: ".env.local" });

type CatalogItem = {
  name: string;
  slug: string;
  description: string;
  category: string;
  image: string;
  price: number;
  originalPrice?: number | null;
  stock: number;
  concern?: string;
  ingredients?: string[];
  images?: string[];
  rating?: number;
  reviewCount?: number;
  badge?: string;
  isFeatured?: boolean;
  isActive?: boolean;
};

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is missing.");

  const file = path.join(
    process.cwd(),
    "scripts",
    "product-catalog-verified.json"
  );

  if (!fs.existsSync(file)) {
    throw new Error(
      "Create scripts/product-catalog-verified.json with the verified catalog first."
    );
  }

  const catalog = JSON.parse(
    fs.readFileSync(file, "utf8")
  ) as CatalogItem[];

  if (catalog.length !== 90) {
    throw new Error(`Expected 90 products; found ${catalog.length}. No changes made.`);
  }

  const slugs = new Set<string>();
  const images = new Set<string>();

  for (const p of catalog) {
    if (
      !p.name?.trim() ||
      !p.slug?.trim() ||
      !p.category?.trim() ||
      !p.description?.trim() ||
      !p.image?.startsWith("/images/products/") ||
      !Number.isFinite(p.price) ||
      p.price < 0 ||
      !Number.isInteger(p.stock) ||
      p.stock < 0
    ) {
      throw new Error(`Invalid or unverified fields for image: ${p.image}`);
    }

    if (
      p.name.toLowerCase().startsWith("verify product:") ||
      p.category === "Uncategorized"
    ) {
      throw new Error(`Placeholder data remains for ${p.image}`);
    }

    if (slugs.has(p.slug) || images.has(p.image)) {
      throw new Error(`Duplicate slug or image: ${p.image}`);
    }

    slugs.add(p.slug);
    images.add(p.image);

    const localImage = path.join(
      process.cwd(),
      "public",
      p.image.replace(/^\/+/, "")
    );

    if (!fs.existsSync(localImage)) {
      throw new Error(`Image file missing: ${p.image}`);
    }
  }

  await mongoose.connect(uri);

  try {
    const dbProducts = await Product.find({})
      .select("_id image")
      .lean();

    const dbImages = new Set(dbProducts.map((p) => p.image));

    for (const p of catalog) {
      if (!dbImages.has(p.image)) {
        throw new Error(`No existing database record for ${p.image}`);
      }
    }

    if (dbProducts.length !== catalog.length) {
      throw new Error(
        `Database has ${dbProducts.length} records; catalog has ${catalog.length}. No changes made.`
      );
    }

    // Update only after the full catalog passes validation.
    for (const p of catalog) {
      await Product.updateOne(
        { image: p.image },
        {
          $set: {
            name: p.name.trim(),
            slug: p.slug.trim().toLowerCase(),
            description: p.description.trim(),
            category: p.category.trim(),
            concern: p.concern ?? "",
            ingredients: p.ingredients ?? [],
            price: p.price,
            originalPrice: p.originalPrice ?? null,
            images: p.images?.length ? p.images : [p.image],
            stock: p.stock,
            rating: p.rating ?? 0,
            reviewCount: p.reviewCount ?? 0,
            badge: p.badge ?? "",
            isFeatured: p.isFeatured ?? false,
            isActive: p.isActive ?? true,
          },
        }
      );
    }

    console.log("Verified catalog update completed.");
    console.log(`Updated ${catalog.length} existing products.`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error("Catalog update failed:", error);
  process.exitCode = 1;
});
