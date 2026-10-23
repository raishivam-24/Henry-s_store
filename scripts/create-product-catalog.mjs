
import fs from "node:fs";
import path from "node:path";

const inventoryPath = path.join(
  process.cwd(),
  "scripts",
  "product-image-inventory.json"
);

const outputPath = path.join(
  process.cwd(),
  "scripts",
  "product-catalog.json"
);

if (!fs.existsSync(inventoryPath)) {
  console.error("Run list-product-images.mjs first.");
  process.exit(1);
}

const inventory = JSON.parse(
  fs.readFileSync(inventoryPath, "utf8")
);

const catalog = inventory.map((image) => ({
  name: "",
  slug: "",
  description: "",
  category: "",
  concern: "",
  ingredients: [],
  price: null,
  originalPrice: null,
  image: image.imagePath,
  images: [image.imagePath],
  stock: null,
  rating: 0,
  reviewCount: 0,
  badge: "",
  isFeatured: false,
  isActive: false,
}));

fs.writeFileSync(
  outputPath,
  JSON.stringify(catalog, null, 2),
  "utf8"
);

console.log(`Created catalog template for ${catalog.length} images.`);
console.log(`File: ${outputPath}`);
console.log("Fill in and verify product details before importing.");
