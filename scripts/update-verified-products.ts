
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product";

dotenv.config({ path: ".env.local" });

type CatalogProduct = {
  image: string;
  name: string;
  description?: string;
  ingredients?: string | string[];
  brand?: string;
  category?: string;
  packSize?: string;
  price: number | null;
  mrp: number | null;
  stock: number | null;
  websiteStatus?: string;
  isActive: boolean;
};

type CatalogFile = {
  totalReviewed: number;
  activeCount: number;
  inactiveCount: number;
  products: CatalogProduct[];
};

function createSlug(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeIngredients(
  ingredients: string | string[] | undefined
): string[] {
  if (!ingredients) return [];

  const values = Array.isArray(ingredients)
    ? ingredients
    : ingredients.split(/[,;\n]+/);

  return values.map((value) => value.trim()).filter(Boolean);
}

function validateCatalog(products: CatalogProduct[]): void {
  if (products.length !== 90) {
    throw new Error(
      `Expected 90 catalog products, received ${products.length}.`
    );
  }

  const images = new Set<string>();

  for (const product of products) {
    if (!product.image || !product.name?.trim()) {
      throw new Error(
        `Product is missing its image or name: ${JSON.stringify(product)}`
      );
    }

    if (images.has(product.image)) {
      throw new Error(`Duplicate catalog image: ${product.image}`);
    }

    images.add(product.image);

    if (typeof product.isActive !== "boolean") {
      throw new Error(
        `Invalid isActive value for ${product.name}`
      );
    }

    // The catalog must exclude only products marked DO NOT ADD.
    const mustBeActive = !(
      product.websiteStatus?.trim().toUpperCase().startsWith("DO NOT ADD")
    );

    if (product.isActive !== mustBeActive) {
      throw new Error(
        `Incorrect status for "${product.name}". ` +
        `Website Status: "${product.websiteStatus ?? ""}". ` +
        `Expected isActive=${mustBeActive}.`
      );
    }
  }

  const active = products.filter((product) => product.isActive).length;
  const inactive = products.length - active;

  if (active !== 76 || inactive !== 14) {
    throw new Error(
      `Unexpected counts: ${active} active, ${inactive} inactive. ` +
      "Expected 76 active and 14 DO NOT ADD products."
    );
  }
}

async function main(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      "MONGODB_URI is missing. Check your .env.local file."
    );
  }

  const catalogPath = path.resolve(
    process.cwd(),
    "scripts",
    "product-catalog-verified.json"
  );

  if (!fs.existsSync(catalogPath)) {
    throw new Error(`Catalog not found: ${catalogPath}`);
  }

  const catalog = JSON.parse(
    fs.readFileSync(catalogPath, "utf-8")
  ) as CatalogFile;

  if (!Array.isArray(catalog.products)) {
    throw new Error(
      "Invalid catalog format: expected a products array."
    );
  }

  const products = catalog.products;

  validateCatalog(products);

  console.log("Catalog validation passed.");
  console.log(`Total products: ${products.length}`);
  console.log(
    `Products to activate: ${products.filter((p) => p.isActive).length}`
  );
  console.log(
    `Products to deactivate: ${products.filter((p) => !p.isActive).length}`
  );

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB.");

  try {
    // Match existing records by image so we update rather than duplicate.
    const existingProducts = await Product.find({})
      .select("_id image")
      .lean();

    const existingImages = new Set(
      existingProducts
        .map((product: any) => product.image)
        .filter(Boolean)
    );

    const missingImages = products
      .filter((product) => !existingImages.has(product.image))
      .map((product) => product.image);

    if (missingImages.length > 0) {
      throw new Error(
        `Cannot find ${missingImages.length} matching MongoDB records:\n` +
        missingImages.join("\n") +
        "\nNo product updates were performed."
      );
    }

    const operations = products.map((product) => {
      const update: Record<string, unknown> = {
        name: product.name.trim(),
        slug: createSlug(product.name),
        description: product.description?.trim() ?? "",
        image: product.image,
        images: [product.image],
        ingredients: normalizeIngredients(product.ingredients),
        brand: product.brand?.trim() ?? "",
        category: product.category?.trim() || "Other",
        concern: "",
        packSize: product.packSize?.trim() ?? "",
        isActive: product.isActive,
      };

      // Keep missing values null rather than inventing prices or stock.
      update.price = product.price ?? null;
      update.originalPrice = product.mrp ?? null;
      update.stock = product.stock ?? null;

      return {
        updateOne: {
          filter: { image: product.image },
          update: { $set: update },
          upsert: false,
        },
      };
    });

    const result = await Product.bulkWrite(operations, {
      ordered: true,
    });

    console.log("\nProduct import completed.");
    console.log(`Matched: ${result.matchedCount}`);
    console.log(`Modified: ${result.modifiedCount}`);
    console.log("Expected active products: 76");
    console.log("Expected inactive products: 14");
    console.log(
      "Only products marked DO NOT ADD were deactivated."
    );
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

main().catch((error: unknown) => {
  console.error("\nProduct import failed:");
  console.error(error);
  process.exitCode = 1;
});
