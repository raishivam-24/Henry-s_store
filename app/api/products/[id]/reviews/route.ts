
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { requireCustomer } from "@/lib/auth";
import Product from "@/models/Product";
import Review from "@/models/Review";
import Order from "@/models/Order";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

// Find active product using slug or MongoDB ObjectId.
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

// GET: Fetch approved product reviews with pagination.
export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required.",
        },
        { status: 400 }
      );
    }

    const product = await findProduct(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

    const searchParams = request.nextUrl.searchParams;

    const requestedPage = Number(
      searchParams.get("page") ?? 1
    );

    const requestedLimit = Number(
      searchParams.get("limit") ?? DEFAULT_LIMIT
    );

    if (
      !Number.isInteger(requestedPage) ||
      requestedPage < 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Page must be a positive integer.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(requestedLimit) ||
      requestedLimit < 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Limit must be a positive integer.",
        },
        { status: 400 }
      );
    }

    const page = requestedPage;
    const limit = Math.min(requestedLimit, MAX_LIMIT);
    const skip = (page - 1) * limit;

    const match = {
      productId: product._id,
      status: "approved" as const,
    };

    const [reviews, totalReviews, ratingStats] =
      await Promise.all([
        Review.find(match)
          .sort({ createdAt: -1, _id: -1 })
          .skip(skip)
          .limit(limit)
          .select(
            "customerName rating title comment images isVerifiedPurchase createdAt"
          )
          .lean(),

        Review.countDocuments(match),

        Review.aggregate([
          {
            $match: match,
          },
          {
            $group: {
              _id: "$rating",
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

    const distribution = [1, 2, 3, 4, 5].map(
      (rating) => {
        const found = ratingStats.find(
          (item: { _id: number; count: number }) =>
            Number(item._id) === rating
        );

        return {
          rating,
          count: found?.count ?? 0,
        };
      }
    );

    const ratingTotal = distribution.reduce(
      (total, item) =>
        total + item.rating * item.count,
      0
    );

    const averageRating =
      totalReviews > 0
        ? Number(
            (ratingTotal / totalReviews).toFixed(1)
          )
        : 0;

    const totalPages = Math.ceil(totalReviews / limit);

    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1 && totalPages > 0;

    return NextResponse.json(
      {
        success: true,

        product: {
          id: String(product._id),
          name: product.name,
        },

        reviews,

        summary: {
          averageRating,
          totalReviews,
          distribution,
        },

        pagination: {
          currentPage: page,
          limit,
          totalReviews,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Get product reviews error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not fetch reviews.",
      },
      { status: 500 }
    );
  }
}

// POST: Submit a review from an authenticated customer.
export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    // 1. Authenticate customer.
    const customer = await requireCustomer();

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in as a customer to submit a review.",
        },
        { status: 401 }
      );
    }

    // 2. Connect to database.
    await connectDB();

    // 3. Get product ID or slug.
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required.",
        },
        { status: 400 }
      );
    }

    // 4. Find active product.
    const product = await findProduct(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

    // 5. Read and validate request body.
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request body.",
        },
        { status: 400 }
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid review data.",
        },
        { status: 400 }
      );
    }

    const data = body as Record<string, unknown>;

    const rating = data.rating;
    const title =
      typeof data.title === "string"
        ? data.title.trim()
        : "";

    const comment =
      typeof data.comment === "string"
        ? data.comment.trim()
        : "";

    // 6. Validate rating.
    if (
      typeof rating !== "number" ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Rating must be a whole number from 1 to 5.",
        },
        { status: 400 }
      );
    }

    // 7. Validate title.
    if (title.length < 3 || title.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Review title must be between 3 and 100 characters.",
        },
        { status: 400 }
      );
    }

    // 8. Validate comment.
    if (comment.length < 10 || comment.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          message: "Review comment must be between 10 and 2000 characters.",
        },
        { status: 400 }
      );
    }
// 9. Verify that the customer purchased and received this product.
const deliveredOrder = await Order.findOne({
  user: customer.id,
  orderStatus: "DELIVERED",
  "items.product": product._id,
}).select("_id");

if (!deliveredOrder) {
  return NextResponse.json(
    {
      success: false,
      message:
        "You can review this product only after receiving it.",
    },
    { status: 403 }
  );
}

// 10. Prevent duplicate reviews.
const existingReview = await Review.findOne({
  user: customer.id,
  productId: product._id,
}).select("_id");

if (existingReview) {
  return NextResponse.json(
    {
      success: false,
      message:
        "You have already submitted a review for this product.",
    },
    { status: 409 }
  );
}

    // 10. Create review.
    // Customer identity is always taken from the authenticated session.
    const review = await Review.create({
      user: customer.id,
      productId: product._id,
      customerName: customer.name,
      rating,
      title,
      comment,
      images: [],
      isVerifiedPurchase: true,
      status: "pending",
    });

    // 11. Return safe review details.
    return NextResponse.json(
      {
        success: true,
        message: "Your review has been submitted for approval.",
        review: {
          id: String(review._id),
          productId: String(review.productId),
          customerName: review.customerName,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          images: review.images,
          isVerifiedPurchase: review.isVerifiedPurchase,
          status: review.status,
          createdAt: review.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // 12. Handle duplicate-key race condition.
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You have already submitted a review for this product.",
        },
        { status: 409 }
      );
    }

    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        {
          success: false,
          message: "Review data is invalid.",
        },
        { status: 400 }
      );
    }

    console.error("Submit product review error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not submit your review.",
      },
      { status: 500 }
    );
  }
}
