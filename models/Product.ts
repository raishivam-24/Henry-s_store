
import mongoose, { Schema, type Model } from "mongoose";

export interface IProduct {
  name: string;
  slug: string;
  description: string;
  category: string;
  concern: string;
  ingredients: string[];
  price: number | null;
  originalPrice: number | null;
  image: string;
  images: string[];
  stock: number | null;
  rating: number;
  reviewCount: number;
  badge?: string;
  isFeatured: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    concern: {
      type: String,
      default: "",
      trim: true,
    },
    ingredients: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      min: 0,
      default: null,
    },
    originalPrice: {
      type: Number,
      min: 0,
      default: null,
    },
    image: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      default: null,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    badge: {
      type: String,
      default: "",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Product: Model<IProduct> =
  mongoose.models.Product ??
  mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
