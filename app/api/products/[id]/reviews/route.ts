
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Review from "@/models/Review";

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
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Get product ID or slug
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

    // 3. Find product
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

    // 4. Read pagination parameters
    const searchParams = request.nextUrl.searchParams;

    const requestedPage = Number(
      searchParams.get("page") ?? 1
    );

    const requestedLimit = Number(
      searchParams.get("limit") ?? DEFAULT_LIMIT
    );

    // 5. Validate pagination values
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

    // 6. Match only approved reviews for this product
    const match = {
  productId: product._id,
  status: "approved" as const,
};

    // 7. Fetch reviews, total count and rating distribution
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

    // 8. Create complete 1–5 star distribution
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

    // 9. Calculate average rating
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

    // 10. Calculate pagination information
    const totalPages = Math.ceil(totalReviews / limit);

    const hasNextPage = page < totalPages;

    const hasPreviousPage = page > 1 && totalPages > 0;

    // 11. Send response
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

// POST handler will be implemented in Phase 5.
// Do not submit reviews through this endpoint until Phase 5 is complete.
