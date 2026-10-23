
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const conditions: Record<string, unknown>[] = [
      { slug: id.toLowerCase() },
    ];

    if (mongoose.Types.ObjectId.isValid(id)) {
      conditions.push({ _id: id });
    }

    const product = await Product.findOne({
      isActive: true,
      $or: conditions,
    }).lean();

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Fetch product detail error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
