
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product";

dotenv.config({ path: ".env.local" });

interface CatalogProduct {
  name: string;
  slug: string;
  description: string;
  category: string;
  concern?: string;
  ingredients?: string[];
  price: number | null;
  originalPrice: number | null;
  image: string;
  images?: string[];
  stock: number | null;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  isFeatured?: boolean;
}

async function main() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing from .env.local");
  }

  const catalogPath = path.join(
    process.cwd(),
    "scripts",
    "product-catalog-prepared.json"
  );

  const catalog = JSON.parse(
    fs.readFileSync(catalogPath, "utf8")
  ) as CatalogProduct[];

  const slugs = catalog.map((product) => product.slug);

  if (new Set(slugs).size !== slugs.length) {
    throw new Error("Duplicate slugs found in catalog.");
  }

  for (const product of catalog) {
    const imagePath = path.join(
      process.cwd(),
      "public",
      product.image.replace(/^\/+/, "")
    );

    if (!fs.existsSync(imagePath)) {
      throw new Error(`Missing image: ${product.image}`);
    }

    if (
      !product.name ||
      !product.slug ||
      !product.description ||
      !product.category
    ) {
      throw new Error(`Missing required fields: ${product.image}`);
    }
  }

  await mongoose.connect(uri);

  try {
    let inserted = 0;
    let skipped = 0;

    for (const product of catalog) {
      const existing = await Product.findOne({
        $or: [
          { slug: product.slug },
          { image: product.image },
        ],
      });

      if (existing) {
  console.log("Skipped:", {
    slug: product.slug,
    existingSlug: existing.slug,
    existingImage: existing.image,
    id: existing._id.toString(),
  });

  skipped++;
  continue;
}

      await Product.create({
  ...product,
  concern: product.concern ?? "",
  ingredients: product.ingredients ?? [],
  images: product.images ?? [product.image],
  rating: product.rating ?? 0,
  reviewCount: product.reviewCount ?? 0,
  badge: product.badge ?? "",
  isFeatured: product.isFeatured ?? false,
  isActive: false,
});

      inserted++;
    }

    console.log("Catalog import completed.");
    console.log(`Inserted: ${inserted}`);
    console.log(`Skipped: ${skipped}`);
    console.log("Imported products remain inactive.");
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(
    "Import failed:",
    error instanceof Error ? error.message : error
  );
  process.exitCode = 1;
});
