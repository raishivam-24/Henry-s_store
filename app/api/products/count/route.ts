
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();

    const total = await Product.countDocuments();
    const active = await Product.countDocuments({ isActive: true });
    const inactive = await Product.countDocuments({ isActive: false });

    return NextResponse.json({
      success: true,
      total,
      active,
      inactive,
    });
  } catch (error) {
    console.error("Product count error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to count products" },
      { status: 500 }
    );
  }
}
