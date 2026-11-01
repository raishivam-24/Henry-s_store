import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Review from "@/models/Review";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function findProduct(id: string) {
  const conditions: Record<string, unknown>[] = [
    { slug: id.toLowerCase() },
  ];

  if (mongoose.Types.ObjectId.isValid(id)) {
    conditions.push({ _id: id });
  }

  return Product.findOne({
    isActive: true,
    $or: conditions,
  }).select("_id name rating reviewCount");
}

function isValidCloudinaryImage(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 1000) {
    return false;
  }

  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      url.hostname === "res.cloudinary.com" &&
      url.pathname.includes("/image/upload/")
    );
  } catch {
    return false;
  }
}

// GET: Only approved reviews are visible to customers.
export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    await connectDB();

    const { id } = await params;
    const product = await findProduct(id);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    const [reviews, summary] = await Promise.all([
      Review.find({
        productId: product._id,
        status: "approved",
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .select("customerName rating title comment images createdAt")
        .lean(),

      Review.aggregate([
        {
          $match: {
            productId: product._id,
            status: "approved",
          },
        },
        {
          $group: {
            _id: "$rating",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const distribution = [1, 2, 3, 4, 5].map((rating) => ({
      rating,
      count:
        summary.find((item) => item._id === rating)?.count ?? 0,
    }));

    const totalReviews = distribution.reduce(
      (total, item) => total + item.count,
      0
    );

    const ratingTotal = distribution.reduce(
      (total, item) => total + item.rating * item.count,
      0
    );

    const averageRating =
      totalReviews > 0
        ? Number((ratingTotal / totalReviews).toFixed(1))
        : 0;

    return NextResponse.json(
      {
        success: true,
        reviews,
        summary: {
          averageRating,
          totalReviews,
          distribution,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Get product reviews error:", error);

    return NextResponse.json(
      { success: false, message: "Could not fetch reviews." },
      { status: 500 }
    );
  }
}

// POST: Customer submissions are pending until an admin approves them.
export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    await connectDB();

    const { id } = await params;
    const product = await findProduct(id);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const customerName =
      typeof body.customerName === "string"
        ? body.customerName.trim()
        : "";

    const title =
      typeof body.title === "string" ? body.title.trim() : "";

    const comment =
      typeof body.comment === "string" ? body.comment.trim() : "";

    const rating = Number(body.rating);

    const images: unknown = body.images ?? [];

    if (!customerName || !title || !comment || body.rating === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, rating, review title and comment are required.",
        },
        { status: 400 }
      );
    }

    if (
      customerName.length < 2 ||
      customerName.length > 60 ||
      title.length < 3 ||
      title.length > 100 ||
      comment.length < 10 ||
      comment.length > 2000
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please check the length of your name, title and review.",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Rating must be a whole number from 1 to 5.",
        },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(images) ||
      images.length > 5 ||
      !images.every(isValidCloudinaryImage)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide up to 5 valid Cloudinary image URLs.",
        },
        { status: 400 }
      );
    }

    const review = await Review.create({
      productId: product._id,
      customerName,
      rating,
      title,
      comment,
      images,
      status: "pending",
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Thank you! Your review has been submitted and is awaiting admin approval.",
        reviewId: String(review._id),
        status: review.status,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Submit product review error:", error);

    return NextResponse.json(
      { success: false, message: "Could not submit your review." },
      { status: 500 }
    );
  }
}