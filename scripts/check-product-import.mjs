
import fs from "node:fs";
import path from "node:path";

const catalogPath = path.join(
  process.cwd(),
  "scripts",
  "product-catalog-prepared.json"
);

if (!fs.existsSync(catalogPath)) {
  console.error("Catalog file not found:", catalogPath);
  process.exit(1);
}

const catalog = JSON.parse(
  fs.readFileSync(catalogPath, "utf8")
);

const errors = [];
const warnings = [];
const seenSlugs = new Set();
const duplicateSlugs = new Set();
const seenImages = new Set();
const duplicateImages = new Set();

for (const [index, product] of catalog.entries()) {
  const label = `Product ${index + 1} (${product.image ?? "no image"})`;

  // Check required fields
  for (const field of ["name", "slug", "description", "category", "image"]) {
    if (
      typeof product[field] !== "string" ||
      product[field].trim() === ""
    ) {
      errors.push(`${label}: missing or invalid ${field}`);
    }
  }

  // Check duplicate slugs
  if (product.slug) {
    if (seenSlugs.has(product.slug)) {
      duplicateSlugs.add(product.slug);
    }
    seenSlugs.add(product.slug);
  }

  // Check duplicate image paths
  if (product.image) {
    if (seenImages.has(product.image)) {
      duplicateImages.add(product.image);
    }
    seenImages.add(product.image);
  }

  // Check image existence
  if (product.image) {
    const relativeImage = product.image.replace(/^\/+/, "");
    const imagePath = path.join(process.cwd(), "public", relativeImage);

    if (!fs.existsSync(imagePath)) {
      errors.push(`${label}: image file not found`);
    }
  }

  // Check price
  if (
    product.price !== null &&
    (!Number.isFinite(product.price) || product.price <= 0)
  ) {
    errors.push(`${label}: invalid price`);
  }

  if (product.price === null) {
    if (
      product.priceNeedsReview &&
      Array.isArray(product.priceOptions) &&
      product.priceOptions.length === 2
    ) {
      warnings.push(
        `${label}: price needs confirmation (${product.priceOptions.join(" or ")})`
      );
    } else {
      warnings.push(`${label}: price not confirmed`);
    }
  }

  // Products should remain inactive until verified
  if (product.isActive !== false) {
    warnings.push(`${label}: product is not marked inactive`);
  }

  if (!product.category || product.category === "Uncategorized") {
    warnings.push(`${label}: category needs confirmation`);
  }

  if (product.stock === null || product.stock === undefined) {
    warnings.push(`${label}: stock quantity not confirmed`);
  }
}

// Report duplicate values
for (const slug of duplicateSlugs) {
  errors.push(`Duplicate slug: ${slug}`);
}

for (const image of duplicateImages) {
  warnings.push(`Image used by multiple products: ${image}`);
}

console.log("\n========== PRODUCT IMPORT DRY RUN ==========");
console.log(`Products in catalog: ${catalog.length}`);
console.log(`Unique slugs: ${seenSlugs.size}`);
console.log(`Unique image paths: ${seenImages.size}`);
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);

if (errors.length > 0) {
  console.log("\nERRORS:");
  errors.forEach((error) => console.log(`- ${error}`));
}

if (warnings.length > 0) {
  console.log("\nWARNINGS (first 30):");
  warnings.slice(0, 30).forEach((warning) => console.log(`- ${warning}`));

  if (warnings.length > 30) {
    console.log(`...and ${warnings.length - 30} more warnings`);
  }
}

if (errors.length === 0) {
  console.log("\nDRY RUN PASSED: no blocking errors found.");
  console.log("No database changes were made.");
} else {
  console.log("\nDRY RUN FAILED: fix the errors before importing.");
  process.exitCode = 1;
}
