
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { requireCustomer } from "@/lib/auth";
import Order from "@/models/Order";
import Product from "@/models/Product";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  _request: NextRequest,
  context: RouteContext
) {
  let activeSession: mongoose.ClientSession | null = null;

  try {
    // 1. Authenticate customer
    const customer = await requireCustomer();

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to cancel your order.",
        },
        { status: 401 }
      );
    }

    // 2. Validate order ID
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

    // 3. Start MongoDB transaction
    const session = await mongoose.startSession();
    activeSession = session;

    let result: {
      orderId: string;
      orderStatus: string;
    } | null = null;

    await session.withTransaction(async () => {
      // 4. Find order belonging to logged-in customer
      const order = await Order.findOne({
        _id: id,
        user: customer.id,
      }).session(session);

      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }

      // 5. Check current order status
      if (order.orderStatus === "CANCELLED") {
        throw new Error("ORDER_ALREADY_CANCELLED");
      }

      if (
        !["PLACED", "CONFIRMED", "PROCESSING"].includes(
          order.orderStatus
        )
      ) {
        throw new Error("ORDER_CANNOT_BE_CANCELLED");
      }

      // 6. Restore product stock
      for (const item of order.items) {
        const product = await Product.findById(
          item.product
        ).session(session);

        if (!product) {
          throw new Error("PRODUCT_NOT_FOUND");
        }

        if (
          typeof product.stock !== "number" ||
          !Number.isFinite(item.quantity) ||
          item.quantity <= 0
        ) {
          throw new Error("INVALID_PRODUCT_STOCK");
        }

        product.stock += item.quantity;

        await product.save({ session });
      }

      // 7. Update order status
      order.orderStatus = "CANCELLED";

      await order.save({ session });

      result = {
        orderId: String(order._id),
        orderStatus: order.orderStatus,
      };
    });

    // 8. Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Your order has been cancelled successfully.",
        order: result,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Order cancellation error:", error);

    if (error instanceof Error) {
      switch (error.message) {
        case "ORDER_NOT_FOUND":
          return NextResponse.json(
            {
              success: false,
              message: "Order not found.",
            },
            { status: 404 }
          );

        case "ORDER_ALREADY_CANCELLED":
          return NextResponse.json(
            {
              success: false,
              message: "This order has already been cancelled.",
            },
            { status: 409 }
          );

        case "ORDER_CANNOT_BE_CANCELLED":
          return NextResponse.json(
            {
              success: false,
              message:
                "This order cannot be cancelled because it has already been shipped or delivered.",
            },
            { status: 400 }
          );

        case "PRODUCT_NOT_FOUND":
          return NextResponse.json(
            {
              success: false,
              message: "A product in this order could not be found.",
            },
            { status: 404 }
          );

        case "INVALID_PRODUCT_STOCK":
          return NextResponse.json(
            {
              success: false,
              message: "Product stock information is invalid.",
            },
            { status: 500 }
          );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to cancel your order. Please try again.",
      },
      { status: 500 }
    );
  } finally {
    if (activeSession) {
      await activeSession.endSession();
    }
  }
}
