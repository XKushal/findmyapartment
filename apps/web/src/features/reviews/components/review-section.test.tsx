import { describe, expect, it } from "vitest";

import {
  averageReviewRating,
  ReviewSectionView,
  reviewRatingLabel,
} from "@/features/reviews/components/review-section";
import type { ReviewApiResponse } from "@/features/reviews/schemas";

function includesText(
  node: unknown,
  text: string,
  seen = new WeakSet<object>(),
): boolean {
  if (typeof node === "string" || typeof node === "number") {
    return String(node).includes(text);
  }

  if (!node || typeof node !== "object") {
    return false;
  }

  if (seen.has(node)) {
    return false;
  }
  seen.add(node);

  return Object.values(node).some((value) => includesText(value, text, seen));
}

const reviews: ReviewApiResponse[] = [
  {
    id: "review-1",
    listingId: "listing-1",
    authorId: "renter-1",
    authorName: "Renter One",
    body: "Accurate listing and helpful poster.",
    rating: 5,
    createdAt: "2026-05-19T12:00:00.000Z",
    updatedAt: "2026-05-19T12:00:00.000Z",
  },
  {
    id: "review-2",
    listingId: "listing-1",
    authorId: "renter-2",
    authorName: "Renter Two",
    body: "Good location.",
    rating: 4,
    createdAt: "2026-05-20T12:00:00.000Z",
    updatedAt: "2026-05-20T12:00:00.000Z",
  },
  {
    id: "review-3",
    listingId: "listing-1",
    authorId: "renter-3",
    authorName: "Renter Three",
    body: "No rating, just a note.",
    rating: null,
    createdAt: "2026-05-21T12:00:00.000Z",
    updatedAt: "2026-05-21T12:00:00.000Z",
  },
];

describe("review rating helpers", () => {
  it("calculates an average from rated reviews only", () => {
    expect(averageReviewRating(reviews)).toBe("4.5");
  });

  it("formats review ratings with a readable label", () => {
    expect(reviewRatingLabel(4)).toBe("Rating: 4 out of 5");
  });
});

describe("ReviewSection", () => {
  it("shows average rating and clearer rating labels", () => {
    const section = ReviewSectionView({
      currentUserId: null,
      editingReviewId: null,
      initialReviews: reviews,
      isSubmitting: false,
      listingId: "listing-1",
      onCreateReview: () => undefined,
      onDeleteReview: () => undefined,
      onEditReview: () => undefined,
      onUpdateReview: () => undefined,
      error: null,
      notice: null,
      setEditingReviewId: () => undefined,
    });

    expect(includesText(section, "4.5 average from 2 ratings")).toBe(true);
    expect(includesText(section, "Rating: 5 out of 5")).toBe(true);
  });

  it("shows owner copy instead of the add-review form for listing owners", () => {
    const section = ReviewSectionView({
      currentUserId: "owner-1",
      editingReviewId: null,
      initialReviews: reviews,
      isOwner: true,
      isSubmitting: false,
      listingId: "listing-1",
      onCreateReview: () => undefined,
      onDeleteReview: () => undefined,
      onEditReview: () => undefined,
      onUpdateReview: () => undefined,
      error: null,
      notice: null,
      setEditingReviewId: () => undefined,
    });

    expect(includesText(section, "Owners cannot review their own listings.")).toBe(
      true,
    );
    expect(includesText(section, "Post review")).toBe(false);
  });
});
