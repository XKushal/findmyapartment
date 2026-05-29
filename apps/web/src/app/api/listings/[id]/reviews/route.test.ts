import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "@/app/api/listings/[id]/reviews/route";
import {
  createReview,
  getReviewsForListing,
} from "@/features/reviews/mutations";
import { authRequired, forbidden } from "@/server/api/errors";
import { requireCurrentUser } from "@/server/auth/current-user";

vi.mock("@/features/reviews/mutations", () => ({
  createReview: vi.fn(),
  getReviewsForListing: vi.fn(),
}));

vi.mock("@/server/auth/current-user", () => ({
  requireCurrentUser: vi.fn(),
}));

const review = {
  id: "507f1f77bcf86cd799439111",
  listingId: "507f1f77bcf86cd799439011",
  authorId: "507f1f77bcf86cd799439099",
  authorName: "Owner",
  body: "Helpful poster and accurate room details.",
  rating: 5,
  createdAt: new Date("2026-05-19T12:00:00.000Z"),
  updatedAt: new Date("2026-05-19T12:00:00.000Z"),
};

describe("listing review APIs", () => {
  beforeEach(() => {
    vi.mocked(createReview).mockReset();
    vi.mocked(getReviewsForListing).mockReset();
    vi.mocked(requireCurrentUser).mockResolvedValue({
      id: review.authorId,
      email: "owner@example.com",
      name: "Owner",
    });
  });

  it("returns reviews for a listing in newest-first order", async () => {
    vi.mocked(getReviewsForListing).mockResolvedValue([review]);

    const response = await GET(
      new Request(`http://localhost:3000/api/listings/${review.listingId}/reviews`),
      { params: Promise.resolve({ id: review.listingId }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: {
        reviews: [
          {
            ...review,
            createdAt: "2026-05-19T12:00:00.000Z",
            updatedAt: "2026-05-19T12:00:00.000Z",
          },
        ],
      },
    });
    expect(getReviewsForListing).toHaveBeenCalledWith(review.listingId);
  });

  it("creates a review with an optional rating for the signed-in user", async () => {
    vi.mocked(createReview).mockResolvedValue(review);

    const response = await POST(
      new Request(`http://localhost:3000/api/listings/${review.listingId}/reviews`, {
        method: "POST",
        body: JSON.stringify({
          body: review.body,
          rating: review.rating,
        }),
      }),
      { params: Promise.resolve({ id: review.listingId }) },
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      data: {
        review: {
          id: review.id,
          body: review.body,
          rating: 5,
        },
      },
    });
    expect(createReview).toHaveBeenCalledWith(
      review.listingId,
      {
        body: review.body,
        rating: 5,
      },
      review.authorId,
    );
  });

  it("returns validation errors for invalid review bodies", async () => {
    const response = await POST(
      new Request(`http://localhost:3000/api/listings/${review.listingId}/reviews`, {
        method: "POST",
        body: JSON.stringify({
          body: "",
          rating: 6,
        }),
      }),
      { params: Promise.resolve({ id: review.listingId }) },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
      },
    });
    expect(createReview).not.toHaveBeenCalled();
  });

  it("requires a signed-in user to create a review", async () => {
    vi.mocked(requireCurrentUser).mockRejectedValue(authRequired());

    const response = await POST(
      new Request(`http://localhost:3000/api/listings/${review.listingId}/reviews`, {
        method: "POST",
        body: JSON.stringify({
          body: review.body,
          rating: review.rating,
        }),
      }),
      { params: Promise.resolve({ id: review.listingId }) },
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "AUTH_REQUIRED",
      },
    });
    expect(createReview).not.toHaveBeenCalled();
  });

  it("returns FORBIDDEN when an owner reviews their own listing", async () => {
    vi.mocked(createReview).mockRejectedValue(
      forbidden("Listing owners cannot review their own listings."),
    );

    const response = await POST(
      new Request(`http://localhost:3000/api/listings/${review.listingId}/reviews`, {
        method: "POST",
        body: JSON.stringify({
          body: review.body,
          rating: review.rating,
        }),
      }),
      { params: Promise.resolve({ id: review.listingId }) },
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "FORBIDDEN",
        message: "Listing owners cannot review their own listings.",
      },
    });
  });
});
