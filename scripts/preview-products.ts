
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product";

dotenv.config({ path: ".env.local" });

async function main() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing from .env.local");
  }

  await mongoose.connect(uri);

  try {
    const products = await Product.find({})
      .select(
        "name slug category price originalPrice image stock isActive badge"
      )
      .limit(10)
      .lean();

    console.log(
      JSON.stringify(
        products.map((product) => ({
          id: String(product._id),
          name: product.name,
          slug: product.slug,
          category: product.category,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          stock: product.stock,
          isActive: product.isActive,
          badge: product.badge,
        })),
        null,
        2
      )
    );
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error("Preview failed:", error);
  process.exitCode = 1;
});
