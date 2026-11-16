
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { requireCustomer } from "@/lib/auth";
import Order from "@/models/Order";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const customer = await requireCustomer();

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to view your order.",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order ID.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Customer can only access their own order.
    const order = await Order.findOne({
      _id: id,
      user: customer.id,
    }).lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        { status: 404 }
      );
    }

    const formattedOrder = {
      ...order,
      _id: String(order._id),
      user: String(order.user),
      items: order.items.map((item) => ({
        ...item,
        product: String(item.product),
      })),
    };

    return NextResponse.json(
      {
        success: true,
        order: formattedOrder,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Fetch order details error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not fetch order details.",
      },
      { status: 500 }
    );
  }
}
