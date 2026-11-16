
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { requireCustomer } from "@/lib/auth";
import Product from "@/models/Product";
import Order from "@/models/Order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RequestItem = {
  id: string;
  quantity: number;
};

type ShippingAddress = {
  name: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
};

class OrderValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "OrderValidationError";
    this.status = status;
  }
}

function cleanString(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function validateAddress(value: unknown): ShippingAddress {
  if (!value || typeof value !== "object") {
    throw new OrderValidationError("Shipping address is required.");
  }

  const input = value as Record<string, unknown>;

  const address: ShippingAddress = {
    name: cleanString(input.name, 100),
    phone: cleanString(input.phone, 10),
    addressLine: cleanString(input.addressLine, 300),
    city: cleanString(input.city, 100),
    state: cleanString(input.state, 100),
    pincode: cleanString(input.pincode, 6),
  };

  if (
    !address.name ||
    !address.phone ||
    !address.addressLine ||
    !address.city ||
    !address.state ||
    !address.pincode
  ) {
    throw new OrderValidationError(
      "Please provide all required shipping address fields."
    );
  }

  if (!/^\d{10}$/.test(address.phone)) {
    throw new OrderValidationError(
      "Please enter a valid 10-digit phone number."
    );
  }

  if (!/^\d{6}$/.test(address.pincode)) {
    throw new OrderValidationError(
      "Please enter a valid 6-digit pincode."
    );
  }

  return address;
}

function validateItems(value: unknown): RequestItem[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new OrderValidationError("Your cart is empty.");
  }

  if (value.length > 50) {
    throw new OrderValidationError(
      "Too many different products in one order."
    );
  }

  const quantities = new Map<string, number>();

  for (const item of value) {
    if (!item || typeof item !== "object") {
      throw new OrderValidationError("Invalid cart item.");
    }

    const input = item as Record<string, unknown>;

    const id = typeof input.id === "string" ? input.id.trim() : "";
    const quantity = input.quantity;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new OrderValidationError("Invalid product in your cart.");
    }

    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 100
    ) {
      throw new OrderValidationError("Invalid product quantity.");
    }

    const previousQuantity = quantities.get(id) ?? 0;
    const combinedQuantity = previousQuantity + quantity;

    if (combinedQuantity > 100) {
      throw new OrderValidationError(
        "Maximum quantity per product is 100."
      );
    }

    quantities.set(id, combinedQuantity);
  }

  return Array.from(quantities.entries()).map(([id, quantity]) => ({
    id,
    quantity,
  }));
}

/* =========================================
   GET: Fetch logged-in customer's orders
========================================= */

export async function GET() {
  try {
    const customer = await requireCustomer();

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in to view your orders.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const orders = await Order.find({
      user: customer.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    const formattedOrders = orders.map((order) => ({
      _id: String(order._id),
      items: order.items.map((item) => ({
        product: String(item.product),
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        price: item.price,
      })),
      shippingAddress: order.shippingAddress,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      status: order.orderStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    return NextResponse.json(
      {
        success: true,
        count: formattedOrders.length,
        orders: formattedOrders,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Fetch customer orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not fetch your orders. Please try again.",
      },
      { status: 500 }
    );
  }
}

/* =========================================
   POST: Place a new COD order
========================================= */

export async function POST(request: NextRequest) {
  let session: mongoose.ClientSession | null = null;

  try {
    const customer = await requireCustomer();

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please log in with your customer account to place an order.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    const items = validateItems(body.items);
    const shippingAddress = validateAddress(body.shippingAddress);

    if (body.paymentMethod !== "COD") {
      throw new OrderValidationError(
        "Currently, only Cash on Delivery is available."
      );
    }

    const activeSession = await mongoose.startSession();
    session = activeSession;

    let createdOrderId = "";
    let createdOrderTotal = 0;

    await activeSession.withTransaction(async () => {
      const productIds = items.map(
        (item) => new mongoose.Types.ObjectId(item.id)
      );

      const products = await Product.find({
        _id: { $in: productIds },
        isActive: true,
      }).session(activeSession);

      if (products.length !== items.length) {
        throw new OrderValidationError(
          "One or more products are unavailable. Please refresh your cart.",
          409
        );
      }

      const productMap = new Map(
        products.map((product) => [String(product._id), product])
      );

      const orderItems = [];
      let subtotal = 0;

      for (const item of items) {
        const product = productMap.get(item.id);

        if (!product) {
          throw new OrderValidationError(
            "A product in your cart is unavailable.",
            409
          );
        }

        if (
          typeof product.price !== "number" ||
          !Number.isFinite(product.price) ||
          product.price < 0
        ) {
          throw new OrderValidationError(
            `${product.name} does not have a valid price.`,
            409
          );
        }

        if (
          typeof product.stock !== "number" ||
          !Number.isInteger(product.stock) ||
          product.stock < item.quantity
        ) {
          throw new OrderValidationError(
            `Insufficient stock for ${product.name}. Available stock: ${
              typeof product.stock === "number" ? product.stock : 0
            }.`,
            409
          );
        }

        subtotal += product.price * item.quantity;

        orderItems.push({
          product: product._id,
          name: product.name,
          image: product.image || product.images?.[0] || "",
          quantity: item.quantity,
          price: product.price,
        });
      }

      const shippingFee = 0;
      const total = subtotal + shippingFee;

      // Atomically reserve stock.
      for (const item of items) {
        const product = productMap.get(item.id);

        if (!product) {
          throw new OrderValidationError(
            "A product in your cart is unavailable.",
            409
          );
        }

        const stockUpdate = await Product.updateOne(
          {
            _id: product._id,
            isActive: true,
            stock: { $gte: item.quantity },
            price: product.price,
          },
          {
            $inc: { stock: -item.quantity },
          },
          { session: activeSession }
        );

        if (stockUpdate.modifiedCount !== 1) {
          throw new OrderValidationError(
            `Stock or price changed for ${product.name}. Please refresh your cart.`,
            409
          );
        }
      }

      const createdOrders = await Order.create(
        [
          {
            user: new mongoose.Types.ObjectId(customer.id),
            items: orderItems,
            shippingAddress,
            subtotal,
            shippingFee,
            total,
            paymentMethod: "COD",
            paymentStatus: "PENDING",
            orderStatus: "PLACED",
          },
        ],
        { session: activeSession }
      );

      createdOrderId = String(createdOrders[0]._id);
      createdOrderTotal = total;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your order has been placed successfully.",
        order: {
          id: createdOrderId,
          total: createdOrderTotal,
          paymentMethod: "COD",
          paymentStatus: "PENDING",
          orderStatus: "PLACED",
        },
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    if (error instanceof OrderValidationError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: error.status }
      );
    }

    console.error("Create order error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not place your order. Please try again.",
      },
      { status: 500 }
    );
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}
