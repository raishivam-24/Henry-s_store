
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const catalogPath = path.join(
  process.cwd(),
  "scripts",
  "product-catalog-prepared.json"
);

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

function normalizeProduct(product) {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    category: product.category,
    concern: product.concern ?? "",
    ingredients: product.ingredients ?? [],
    price: product.price ?? null,
    originalPrice: product.originalPrice ?? null,
    image: product.image,
    images: product.images ?? [product.image],
    stock: product.stock ?? null,
    rating: product.rating ?? 0,
    reviewCount: product.reviewCount ?? 0,
    badge: product.badge ?? "",
    isFeatured: product.isFeatured ?? false,
    isActive: false,
  };
}

async function importCatalog() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing from .env.local");
  }

  const slugs = catalog.map((product) => product.slug);

  if (new Set(slugs).size !== slugs.length) {
    throw new Error("Duplicate slugs found. Fix them before importing.");
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

    if (!product.name || !product.slug || !product.description || !product.category) {
      throw new Error(`Missing required fields for ${product.image}`);
    }
  }

  await mongoose.connect(mongoUri);

  const { default: Product } = await import("../models/Product.ts");

  let inserted = 0;
  let skipped = 0;

  try {
    for (const rawProduct of catalog) {
      const product = normalizeProduct(rawProduct);

      const existing = await Product.findOne({
        $or: [{ slug: product.slug }, { image: product.image }],
      }).lean();

      if (existing) {
        skipped++;
        continue;
      }

      await Product.create(product);
      inserted++;
    }

    console.log(`Catalog import completed.`);
    console.log(`Inserted: ${inserted}`);
    console.log(`Skipped existing products: ${skipped}`);
    console.log("All imported products are inactive.");
  } finally {
    await mongoose.disconnect();
  }
}

importCatalog().catch((error) => {
  console.error("Catalog import failed:", error.message);
  process.exitCode = 1;
});
