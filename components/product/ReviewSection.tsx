
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Star,
  X,
  ImagePlus,
  Send,
  Loader2,
} from "lucide-react";

type Review = {
  _id: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  createdAt: string;
};

type Distribution = {
  rating: number;
  count: number;
};

type Props = {
  productId: string;
};

type ReviewResponse = {
  success: boolean;
  message?: string;
  reviews?: Review[];
  summary?: {
    averageRating?: number;
    totalReviews?: number;
    distribution?: Distribution[];
  };
};

export default function ReviewSection({ productId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);
  const [distribution, setDistribution] = useState<Distribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const endpoint = `/api/products/${encodeURIComponent(productId)}/reviews`;

  // Generate local image previews from the selected files.
  const previews = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files]
  );

  // Release generated preview URLs when files change or component unmounts.
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  // Load approved reviews.
  const loadReviews = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const response = await fetch(endpoint, {
          cache: "no-store",
          signal,
        });

        const data: ReviewResponse = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Could not load reviews.");
        }

        setReviews(data.reviews ?? []);
        setAverage(data.summary?.averageRating ?? 0);
        setTotal(data.summary?.totalReviews ?? 0);
        setDistribution(data.summary?.distribution ?? []);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("Review loading error:", error);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [endpoint]
  );

  useEffect(() => {
    const controller = new AbortController();

    // Defer the request so the effect does not synchronously trigger state updates.
    queueMicrotask(() => {
      if (!controller.signal.aborted) {
        void loadReviews(controller.signal);
      }
    });

    return () => {
      controller.abort();
    };
  }, [loadReviews]);

  function selectFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";

    const valid = selected.filter(
      (file) =>
        file.type.startsWith("image/") &&
        file.size <= 5 * 1024 * 1024
    );

    if (valid.length !== selected.length) {
      setMessage("Only image files up to 5 MB are allowed.");
      setSuccess(false);
    } else {
      setMessage("");
    }

    setFiles((current) => [...current, ...valid].slice(0, 5));
  }

  async function uploadImages(): Promise<string[]> {
    if (files.length === 0) return [];

    const signatureResponse = await fetch(
      "/api/reviews/upload-signature",
      { method: "POST" }
    );

    const signatureData = await signatureResponse.json();

    if (!signatureResponse.ok || !signatureData.success) {
      throw new Error(
        signatureData.message || "Could not prepare photo upload."
      );
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("api_key", signatureData.apiKey);
      formData.append("timestamp", String(signatureData.timestamp));
      formData.append("folder", signatureData.folder);
      formData.append("signature", signatureData.signature);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadData.secure_url) {
        throw new Error("A customer photo could not be uploaded.");
      }

      uploadedUrls.push(uploadData.secure_url);
    }

    return uploadedUrls;
  }

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setSuccess(false);

    if (rating < 1 || rating > 5) {
      setMessage("Please select a star rating.");
      return;
    }

    if (name.trim().length < 2) {
      setMessage("Please enter your name.");
      return;
    }

    if (title.trim().length < 3) {
      setMessage("Review title must contain at least 3 characters.");
      return;
    }

    if (comment.trim().length < 10) {
      setMessage("Your review must contain at least 10 characters.");
      return;
    }

    try {
      setSubmitting(true);
      setUploading(true);

      const imageUrls = await uploadImages();

      setUploading(false);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: name.trim(),
          rating,
          title: title.trim(),
          comment: comment.trim(),
          images: imageUrls,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Review submission failed.");
      }

      setSuccess(true);
      setMessage(
        "Thank you! Your review has been submitted and is awaiting admin approval."
      );

      setName("");
      setRating(0);
      setHoverRating(0);
      setTitle("");
      setComment("");
      setFiles([]);
      setShowForm(false);

      // Pending reviews are deliberately not added to the public list.
      await loadReviews();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  }

  return (
    <section id="reviews" className="scroll-mt-28">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
            Real customer experiences
          </p>

          <h2 className="mt-2 text-3xl font-semibold text-[#1d392d]">
            Reviews & Ratings
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Share your experience with this product.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowForm((value) => !value);
            setMessage("");
          }}
          className="flex items-center justify-center gap-2 rounded-full bg-[#1d392d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#294b3b]"
        >
          <Send size={16} />
          Write a Review
        </button>
      </div>

      {/* Rating summary */}
      <div className="mt-8 grid gap-6 rounded-2xl bg-[#f7f8f5] p-6 sm:grid-cols-[180px_1fr] sm:p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <span className="text-5xl font-semibold text-[#1d392d]">
            {average.toFixed(1)}
          </span>

          <div className="mt-2 flex gap-1 text-amber-500">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={17}
                fill={index < Math.round(average) ? "currentColor" : "none"}
              />
            ))}
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Based on {total} approved reviews
          </p>
        </div>

        <div className="flex flex-col justify-center gap-3">
          {[5, 4, 3, 2, 1].map((value) => {
            const count =
              distribution.find((item) => item.rating === value)?.count ?? 0;

            const percentage = total ? (count / total) * 100 : 0;

            return (
              <div
                key={value}
                className="grid grid-cols-[32px_1fr_32px] items-center gap-3"
              >
                <span className="flex items-center gap-1 text-xs text-gray-600">
                  {value} <Star size={11} fill="currentColor" />
                </span>

                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <span className="text-right text-xs text-gray-500">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review submission form */}
      {showForm && (
        <form
          onSubmit={submitReview}
          className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 sm:p-8"
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-semibold text-[#1d392d]">
              Write your review
            </h3>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              aria-label="Close review form"
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
            >
              <X size={19} />
            </button>
          </div>

          <label className="mt-6 block text-sm font-semibold text-gray-800">
            Your rating
          </label>

          <div className="mt-3 flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`Rate ${value} stars`}
                aria-pressed={rating === value}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(value)}
              >
                <Star
                  size={30}
                  className={
                    value <= (hoverRating || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300"
                  }
                />
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Your name
              </label>

              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={60}
                required
                placeholder="Enter your name"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#1d392d] focus:ring-1 focus:ring-[#1d392d]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Review title
              </label>

              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                minLength={3}
                maxLength={100}
                required
                placeholder="Summarize your experience"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#1d392d] focus:ring-1 focus:ring-[#1d392d]"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Your review
            </label>

            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              minLength={10}
              maxLength={2000}
              required
              rows={5}
              placeholder="Tell other customers about your experience..."
              className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#1d392d] focus:ring-1 focus:ring-[#1d392d]"
            />

            <p className="mt-1 text-right text-xs text-gray-400">
              {comment.length}/2000
            </p>
          </div>

          {/* Customer photos */}
          <div className="mt-6">
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Add product photos (optional)
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={selectFiles}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={files.length >= 5}
              className="flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-5 py-4 text-sm text-gray-600 transition hover:border-[#1d392d] disabled:opacity-40"
            >
              <ImagePlus size={19} />
              Upload photos ({files.length}/5)
            </button>

            <p className="mt-2 text-xs text-gray-400">
              Up to 5 images, maximum 5 MB each.
            </p>

            {previews.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {previews.map((preview, index) => (
                  <div
                    key={preview}
                    className="relative h-24 w-24 overflow-hidden rounded-xl border"
                  >
                    <Image
                      src={preview}
                      alt={`Selected customer photo ${index + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setFiles((current) =>
                          current.filter((_, i) => i !== index)
                        )
                      }
                      aria-label="Remove photo"
                      className="absolute right-1 top-1 rounded-full bg-white p-1 text-gray-700 shadow"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {message && (
            <p
              role="status"
              className={`mt-5 rounded-xl p-3 text-sm ${
                success
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-[#1d392d] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#294b3b] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {submitting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Send size={17} />
            )}

            {uploading
              ? "Uploading photos..."
              : submitting
                ? "Submitting..."
                : "Submit review"}
          </button>

          <p className="mt-3 text-xs text-gray-400">
            Your review will be visible after admin approval.
          </p>
        </form>
      )}

      {/* Approved customer reviews */}
      <div className="mt-10">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#1d392d]">
            Customer experiences ({total})
          </h3>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-gray-500">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 px-5 py-12 text-center">
            <Star size={32} className="mx-auto text-amber-500" />

            <h4 className="mt-4 text-lg font-semibold text-[#1d392d]">
              Be the first to review this product
            </h4>

            <p className="mt-2 text-sm text-gray-500">
              Your feedback can help other customers.
            </p>

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-5 rounded-full border border-[#1d392d] px-6 py-3 text-sm font-semibold text-[#1d392d] hover:bg-[#1d392d] hover:text-white"
            >
              Write the first review
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {reviews.map((review) => (
              <article key={review._id} className="py-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {review.customerName}
                    </h4>

                    <div className="mt-2 flex gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          size={14}
                          fill={
                            index < review.rating
                              ? "currentColor"
                              : "none"
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <span className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>

                <h5 className="mt-4 font-semibold text-gray-800">
                  {review.title}
                </h5>

                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-gray-600">
                  {review.comment}
                </p>

                {review.images?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {review.images.map((image, index) => (
                      <a
                        key={`${image}-${index}`}
                        href={image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative h-24 w-24 overflow-hidden rounded-xl border"
                      >
                        <Image
                          src={image}
                          alt={`Customer review photo ${index + 1}`}
                          fill
                          sizes="96px"
                          className="object-cover transition hover:scale-105"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
