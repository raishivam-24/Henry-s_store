
import fs from "node:fs";
import path from "node:path";

const catalogPath = path.join(
  process.cwd(),
  "scripts",
  "product-catalog-prepared.json"
);

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const errors = [];
const warnings = [];
const seenSlugs = new Set();

for (const [index, product] of catalog.entries()) {
  const label = `Product ${index + 1} (${product.image})`;

  if (!product.name?.trim()) errors.push(`${label}: missing name`);
  if (!product.slug?.trim()) errors.push(`${label}: missing slug`);

  if (product.slug) {
    if (seenSlugs.has(product.slug)) {
      errors.push(`${label}: duplicate slug "${product.slug}"`);
    }
    seenSlugs.add(product.slug);
  }

  if (!product.category || product.category === "Uncategorized") {
    warnings.push(`${label}: category needs verification`);
  }

  if (!Number.isFinite(product.price) || product.price <= 0) {
    if (product.priceNeedsReview && product.priceOptions?.length === 2) {
      warnings.push(
        `${label}: choose between prices ${product.priceOptions.join(" and ")}`
      );
    } else {
      errors.push(`${label}: invalid or missing price`);
    }
  }

  if (
    product.originalPrice !== null &&
    (!Number.isFinite(product.originalPrice) ||
      product.originalPrice <= 0)
  ) {
    errors.push(`${label}: invalid originalPrice`);
  }

  if (
    product.originalPrice !== null &&
    Number.isFinite(product.price) &&
    product.originalPrice < product.price
  ) {
    errors.push(`${label}: originalPrice is less than price`);
  }

  if (
    product.stock !== null &&
    (!Number.isInteger(product.stock) || product.stock < 0)
  ) {
    errors.push(`${label}: stock must be a non-negative integer or null`);
  }

  const relativeImage = product.image?.replace(/^\/+/, "");
  const imagePath = relativeImage
    ? path.join(process.cwd(), "public", relativeImage)
    : "";

  if (!imagePath || !fs.existsSync(imagePath)) {
    errors.push(`${label}: image file does not exist`);
  }

  if (product.isActive !== false) {
    warnings.push(`${label}: product should remain inactive until verified`);
  }
}

console.log(`Products checked: ${catalog.length}`);
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);

if (errors.length) {
  console.log("\nERRORS:");
  errors.slice(0, 50).forEach((error) => console.log(`- ${error}`));
}

if (warnings.length) {
  console.log("\nWARNINGS:");
  warnings.slice(0, 30).forEach((warning) => console.log(`- ${warning}`));

  if (warnings.length > 30) {
    console.log(`...and ${warnings.length - 30} more warnings`);
  }
}

if (errors.length) {
  process.exitCode = 1;
} else {
  console.log("\nValidation passed: no blocking errors found.");
}
