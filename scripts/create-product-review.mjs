
import fs from "node:fs";
import path from "node:path";

const inputPath = path.join(
  process.cwd(),
  "scripts",
  "product-catalog-prepared.json"
);

const outputPath = path.join(
  process.cwd(),
  "scripts",
  "product-review.csv"
);

const catalog = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const columns = [
  "image",
  "currentName",
  "verifiedName",
  "category",
  "price",
  "priceOptions",
  "stock",
  "description",
  "approved",
];

function csvValue(value) {
  const text = Array.isArray(value)
    ? value.join(" / ")
    : value == null
      ? ""
      : String(value);

  return `"${text.replaceAll('"', '""')}"`;
}

const rows = catalog.map((product) => ({
  image: product.image,
  currentName: product.name,
  verifiedName: "",
  category: "",
  price: product.price ?? "",
  priceOptions: product.priceOptions ?? [],
  stock: "",
  description: "",
  approved: "NO",
}));

const csv = [
  columns.join(","),
  ...rows.map((row) =>
    columns.map((column) => csvValue(row[column])).join(",")
  ),
].join("\n");

fs.writeFileSync(outputPath, "\uFEFF" + csv, "utf8");

console.log(`Created review file for ${rows.length} products:`);
console.log(outputPath);
