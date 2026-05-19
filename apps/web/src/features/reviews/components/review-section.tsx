"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import type { ReviewApiResponse } from "@/features/reviews/schemas";

type ReviewSectionProps = {
  listingId: string;
  initialReviews: ReviewApiResponse[];
  currentUserId?: string | null;
};

type ApiErrorBody = {
  error?: {
    message?: string;
  };
};

async function readErrorMessage(response: Response, fallback: string) {
  const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
  return body?.error?.message ?? fallback;
}

function reviewAuthor(review: ReviewApiResponse) {
  return review.authorName ?? "AllApartments user";
}

export function ReviewSection({
  listingId,
  initialReviews,
  currentUserId,
}: ReviewSectionProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSignedIn = Boolean(currentUserId);

  async function createReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const ratingValue = String(formData.get("rating") ?? "");

    try {
      const response = await fetch(`/api/listings/${listingId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: String(formData.get("body") ?? ""),
          rating: ratingValue ? Number(ratingValue) : null,
        }),
      });

      if (!response.ok) {
        setError(await readErrorMessage(response, "Could not add review."));
        return;
      }

      const payload = (await response.json()) as {
        data?: { review?: ReviewApiResponse };
      };

      if (payload.data?.review) {
        setReviews((current) => [payload.data!.review!, ...current]);
      }

      form.reset();
      router.refresh();
    } catch {
      setError("Could not add review.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function updateReview(event: FormEvent<HTMLFormElement>, reviewId: string) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const ratingValue = String(formData.get("rating") ?? "");

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: String(formData.get("body") ?? ""),
          rating: ratingValue ? Number(ratingValue) : null,
        }),
      });

      if (!response.ok) {
        setError(await readErrorMessage(response, "Could not update review."));
        return;
      }

      const payload = (await response.json()) as {
        data?: { review?: ReviewApiResponse };
      };

      if (payload.data?.review) {
        setReviews((current) =>
          current.map((review) =>
            review.id === reviewId ? payload.data!.review! : review,
          ),
        );
      }

      setEditingReviewId(null);
      router.refresh();
    } catch {
      setError("Could not update review.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteReview(reviewId: string) {
    if (!window.confirm("Delete this review?")) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setError(await readErrorMessage(response, "Could not delete review."));
        return;
      }

      setReviews((current) => current.filter((review) => review.id !== reviewId));
      router.refresh();
    } catch {
      setError("Could not delete review.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-10 border-t border-zinc-200 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-950">
            Reviews and comments
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            {reviews.length === 0
              ? "No reviews yet."
              : `${reviews.length} review${reviews.length === 1 ? "" : "s"}`}
          </p>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {isSignedIn ? (
        <form onSubmit={createReview} className="mt-5 grid gap-3">
          <label htmlFor="review-body" className="text-sm font-medium text-zinc-800">
            Add a comment
          </label>
          <textarea
            id="review-body"
            name="body"
            required
            rows={4}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
            placeholder="Share what future renters should know."
          />
          <div className="flex flex-wrap items-end gap-3">
            <div className="grid gap-2">
              <label htmlFor="review-rating" className="text-sm font-medium text-zinc-800">
                Rating
              </label>
              <select
                id="review-rating"
                name="rating"
                defaultValue=""
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
              >
                <option value="">No rating</option>
                <option value="5">5</option>
                <option value="4">4</option>
                <option value="3">3</option>
                <option value="2">2</option>
                <option value="1">1</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              {isSubmitting ? "Posting..." : "Post review"}
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-5 rounded-md border border-zinc-200 px-4 py-3 text-sm text-zinc-700">
          Sign in to add a comment or rating.
        </p>
      )}

      <div className="mt-6 grid gap-5">
        {reviews.map((review) => {
          const isAuthor = currentUserId === review.authorId;
          const isEditing = editingReviewId === review.id;

          return (
            <article key={review.id} className="border-t border-zinc-200 pt-5">
              {isEditing ? (
                <form
                  onSubmit={(event) => updateReview(event, review.id)}
                  className="grid gap-3"
                >
                  <textarea
                    name="body"
                    required
                    rows={4}
                    defaultValue={review.body}
                    className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      name="rating"
                      defaultValue={review.rating ?? ""}
                      className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
                    >
                      <option value="">No rating</option>
                      <option value="5">5</option>
                      <option value="4">4</option>
                      <option value="3">3</option>
                      <option value="2">2</option>
                      <option value="1">1</option>
                    </select>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingReviewId(null)}
                      className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium text-zinc-950">
                      {reviewAuthor(review)}
                    </p>
                    {review.rating ? (
                      <p className="text-sm font-semibold text-emerald-700">
                        {review.rating}/5
                      </p>
                    ) : null}
                  </div>
                  <p className="leading-7 text-zinc-700">{review.body}</p>
                  {isAuthor ? (
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingReviewId(review.id)}
                        className="text-sm font-medium text-zinc-950 underline-offset-4 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteReview(review.id)}
                        disabled={isSubmitting}
                        className="text-sm font-medium text-red-700 underline-offset-4 hover:underline disabled:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
