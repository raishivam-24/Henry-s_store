
import fs from "node:fs";
import path from "node:path";

const catalogPath = path.join(
  process.cwd(),
  "scripts",
  "product-catalog.json"
);

const catalog = JSON.parse(
  fs.readFileSync(catalogPath, "utf8")
);

function getFilename(imagePath) {
  return path.basename(imagePath).replace(/\.[^.]+$/, "");
}

function getPrice(filename) {
  const match = filename.match(/^(\d+)or(\d+)$/i);

  if (match) {
    return {
      price: null,
      priceOptions: [Number(match[1]), Number(match[2])],
      priceNeedsReview: true,
    };
  }

  const singlePrice = filename.match(/^(\d+)/);

  if (!singlePrice) {
    return {
      price: null,
      priceOptions: [],
      priceNeedsReview: true,
    };
  }

  return {
    price: Number(singlePrice[1]),
    priceOptions: [],
    priceNeedsReview: false,
  };
}

function createSlug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const prepared = catalog.map((product) => {
  const filename = getFilename(product.image);
  const priceInfo = getPrice(filename);

  const cleanName = filename
    .replace(/perStrip/gi, " per strip")
    .replace(/or/gi, " or ")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    ...product,
    name: product.name || `Verify product: ${cleanName}`,
    slug: product.slug || createSlug(cleanName),
    description:
      product.description ||
      "Product description pending client confirmation.",
    category: product.category || "Uncategorized",
    price: priceInfo.price,
priceOptions: priceInfo.priceOptions,
    originalPrice:
      typeof product.originalPrice === "number"
        ? product.originalPrice
        : null,
    stock:
      Number.isInteger(product.stock) && product.stock >= 0
        ? product.stock
        : null,
    priceNeedsReview: priceInfo.priceNeedsReview,
    isActive: false,
  };
});

const outputPath = path.join(
  process.cwd(),
  "scripts",
  "product-catalog-prepared.json"
);

fs.writeFileSync(
  outputPath,
  JSON.stringify(prepared, null, 2),
  "utf8"
);

const priced = prepared.filter(
  (product) => typeof product.price === "number"
).length;

const needsReview = prepared.filter(
  (product) => product.priceNeedsReview
).length;

console.log(`Prepared ${prepared.length} products.`);
console.log(`Prices extracted: ${priced}`);
console.log(`Prices needing review: ${needsReview}`);
console.log(`Output: ${outputPath}`);
console.log("Products remain inactive until verified.");
