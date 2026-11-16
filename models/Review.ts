
import mongoose, {
  Schema,
  type Model,
  Types,
} from "mongoose";

export type ReviewStatus =
  | "pending"
  | "approved"
  | "rejected";

export interface IReview {
  user: Types.ObjectId;
  productId: Types.ObjectId;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  status: ReviewStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number from 1 to 5.",
      },
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },

    images: {
      type: [String],
      default: [],
      validate: {
        validator: (images: string[]) =>
          images.length <= 5,
        message: "You can upload a maximum of 5 review photos.",
      },
    },

    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent one customer from reviewing the same product twice.
ReviewSchema.index(
  { user: 1, productId: 1 },
  { unique: true }
);

// Optimize approved review queries.
ReviewSchema.index({
  productId: 1,
  status: 1,
  createdAt: -1,
});

const Review: Model<IReview> =
  mongoose.models.Review ||
  mongoose.model<IReview>("Review", ReviewSchema);

export default Review;
