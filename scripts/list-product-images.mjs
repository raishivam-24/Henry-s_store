
import fs from "node:fs";
import path from "node:path";

const imageDirectory = path.join(
  process.cwd(),
  "public",
  "images",
  "products"
);

const extensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
]);

if (!fs.existsSync(imageDirectory)) {
  console.error("Product images folder not found:", imageDirectory);
  process.exit(1);
}

const files = fs
  .readdirSync(imageDirectory, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .filter((name) =>
    extensions.has(path.extname(name).toLowerCase())
  )
  .sort((a, b) => a.localeCompare(b));

const inventory = files.map((filename) => ({
  filename,
  imagePath: `/images/products/${filename}`,
}));

const outputPath = path.join(
  process.cwd(),
  "scripts",
  "product-image-inventory.json"
);

fs.writeFileSync(
  outputPath,
  JSON.stringify(inventory, null, 2),
  "utf8"
);

console.log(`Found ${inventory.length} product images.`);
console.log(`Inventory saved to: ${outputPath}`);
