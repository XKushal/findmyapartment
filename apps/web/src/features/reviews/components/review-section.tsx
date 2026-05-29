"use client";

import { useRouter } from "next/navigation";
import { useState, type Dispatch, type FormEvent, type SetStateAction } from "react";

import type { ReviewApiResponse } from "@/features/reviews/schemas";
import { buttonVariants } from "@/features/ui/button";
import { fieldInput, fieldLabel } from "@/features/ui/field";
import { FormFeedback } from "@/features/ui/form-feedback";

type ReviewSectionProps = {
  listingId: string;
  initialReviews: ReviewApiResponse[];
  currentUserId?: string | null;
  isOwner?: boolean;
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

export function averageReviewRating(reviews: ReviewApiResponse[]) {
  const ratedReviews = reviews.filter(
    (review): review is ReviewApiResponse & { rating: number } =>
      review.rating !== null,
  );

  if (ratedReviews.length === 0) {
    return null;
  }

  const average =
    ratedReviews.reduce((total, review) => total + review.rating, 0) /
    ratedReviews.length;

  return Number.isInteger(average) ? String(average) : average.toFixed(1);
}

function ratedReviewCount(reviews: ReviewApiResponse[]) {
  return reviews.filter((review) => review.rating !== null).length;
}

export function reviewRatingLabel(rating: number) {
  return `Rating: ${rating} out of 5`;
}

type ReviewSectionViewProps = ReviewSectionProps & {
  editingReviewId: string | null;
  error: string | null;
  initialReviews: ReviewApiResponse[];
  isSubmitting: boolean;
  notice: string | null;
  onCreateReview: (event: FormEvent<HTMLFormElement>) => void;
  onDeleteReview: (reviewId: string) => void;
  onEditReview: (reviewId: string) => void;
  onUpdateReview: (
    event: FormEvent<HTMLFormElement>,
    reviewId: string,
  ) => void;
  setEditingReviewId: Dispatch<SetStateAction<string | null>>;
};

export function ReviewSectionView({
  currentUserId,
  editingReviewId,
  error,
  initialReviews: reviews,
  isOwner = false,
  isSubmitting,
  notice,
  onCreateReview,
  onDeleteReview,
  onEditReview,
  onUpdateReview,
  setEditingReviewId,
}: ReviewSectionViewProps) {
  const isSignedIn = Boolean(currentUserId);
  const averageRating = averageReviewRating(reviews);
  const ratingCount = ratedReviewCount(reviews);

  return (
    <section className="mt-10 border-t border-stone-200 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-stone-950">
            Reviews and comments
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            {reviews.length === 0
              ? "No reviews yet."
              : `${reviews.length} review${reviews.length === 1 ? "" : "s"}`}
          </p>
          {averageRating ? (
            <p className="mt-1 text-sm font-medium text-brand-700">
              {`${averageRating} average from ${ratingCount} rating${
                ratingCount === 1 ? "" : "s"
              }`}
            </p>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="mt-4">
          <FormFeedback tone="error">{error}</FormFeedback>
        </div>
      ) : null}
      {notice ? (
        <div className="mt-4">
          <FormFeedback tone={isSubmitting ? "info" : "success"}>
            {notice}
          </FormFeedback>
        </div>
      ) : null}

      {isOwner ? (
        <p className="mt-5 rounded-md border border-stone-200 px-4 py-3 text-sm text-stone-700">
          Owners cannot review their own listings.
        </p>
      ) : isSignedIn ? (
        <form onSubmit={onCreateReview} className="mt-5 grid gap-3">
          <label htmlFor="review-body" className={fieldLabel()}>
            Add a comment
          </label>
          <textarea
            id="review-body"
            name="body"
            required
            rows={4}
            disabled={isSubmitting}
            className={fieldInput()}
            placeholder="Share what future renters should know."
          />
          <div className="flex flex-wrap items-end gap-3">
            <div className="grid gap-2">
              <label htmlFor="review-rating" className={fieldLabel()}>
                Rating
              </label>
              <select
                id="review-rating"
                name="rating"
                defaultValue=""
                disabled={isSubmitting}
                className={fieldInput()}
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
              className={buttonVariants({ size: "sm" })}
            >
              {isSubmitting ? "Posting..." : "Post review"}
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-5 rounded-md border border-stone-200 px-4 py-3 text-sm text-stone-700">
          Sign in to add a comment or rating.
        </p>
      )}

      <div className="mt-6 grid gap-5">
        {reviews.map((review) => {
          const isAuthor = currentUserId === review.authorId;
          const isEditing = editingReviewId === review.id;

          return (
            <article key={review.id} className="border-t border-stone-200 pt-5">
              {isEditing ? (
                <form
                  onSubmit={(event) => onUpdateReview(event, review.id)}
                  className="grid gap-3"
                >
                  <textarea
                    name="body"
                    required
                    rows={4}
                    defaultValue={review.body}
                    disabled={isSubmitting}
                    className={fieldInput()}
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      name="rating"
                      defaultValue={review.rating ?? ""}
                      disabled={isSubmitting}
                      className={fieldInput()}
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
                      className={buttonVariants({ size: "sm" })}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setEditingReviewId(null)}
                      className={buttonVariants({ variant: "secondary", size: "sm" })}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium text-stone-950">
                      {reviewAuthor(review)}
                    </p>
                    {review.rating ? (
                      <p className="text-sm font-semibold text-brand-700">
                        {reviewRatingLabel(review.rating)}
                      </p>
                    ) : null}
                  </div>
                  <p className="leading-7 text-stone-700">{review.body}</p>
                  {isAuthor ? (
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => onEditReview(review.id)}
                        disabled={isSubmitting}
                        className="text-sm font-medium text-stone-950 underline-offset-4 hover:underline disabled:text-stone-400"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteReview(review.id)}
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

export function ReviewSection({
  listingId,
  initialReviews,
  currentUserId,
  isOwner = false,
}: ReviewSectionProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function createReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice("Posting review...");
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
        setNotice(null);
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
      setNotice("Review posted.");
      router.refresh();
    } catch {
      setNotice(null);
      setError("Could not add review.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function updateReview(event: FormEvent<HTMLFormElement>, reviewId: string) {
    event.preventDefault();
    setError(null);
    setNotice("Saving review...");
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
        setNotice(null);
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
      setNotice("Review saved.");
      router.refresh();
    } catch {
      setNotice(null);
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
    setNotice("Deleting review...");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setNotice(null);
        setError(await readErrorMessage(response, "Could not delete review."));
        return;
      }

      setReviews((current) => current.filter((review) => review.id !== reviewId));
      setNotice("Review deleted.");
      router.refresh();
    } catch {
      setNotice(null);
      setError("Could not delete review.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ReviewSectionView
      currentUserId={currentUserId}
      editingReviewId={editingReviewId}
      error={error}
      initialReviews={reviews}
      isOwner={isOwner}
      isSubmitting={isSubmitting}
      listingId={listingId}
      notice={notice}
      onCreateReview={createReview}
      onDeleteReview={(reviewId) => void deleteReview(reviewId)}
      onEditReview={setEditingReviewId}
      onUpdateReview={updateReview}
      setEditingReviewId={setEditingReviewId}
    />
  );
}
