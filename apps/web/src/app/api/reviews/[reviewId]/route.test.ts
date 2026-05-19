import { beforeEach, describe, expect, it, vi } from "vitest";

import { DELETE, PATCH } from "@/app/api/reviews/[reviewId]/route";
import { deleteReview, updateReview } from "@/features/reviews/mutations";
import { authRequired, forbidden } from "@/server/api/errors";
import { requireCurrentUser } from "@/server/auth/current-user";

vi.mock("@/features/reviews/mutations", () => ({
  deleteReview: vi.fn(),
  updateReview: vi.fn(),
}));

vi.mock("@/server/auth/current-user", () => ({
  requireCurrentUser: vi.fn(),
}));

const review = {
  id: "507f1f77bcf86cd799439111",
  listingId: "507f1f77bcf86cd799439011",
  authorId: "507f1f77bcf86cd799439099",
  authorName: "Owner",
  body: "Updated review body.",
  rating: 4,
  createdAt: new Date("2026-05-19T12:00:00.000Z"),
  updatedAt: new Date("2026-05-19T13:00:00.000Z"),
};

describe("review ownership APIs", () => {
  beforeEach(() => {
    vi.mocked(deleteReview).mockReset();
    vi.mocked(updateReview).mockReset();
    vi.mocked(requireCurrentUser).mockResolvedValue({
      id: review.authorId,
      email: "owner@example.com",
      name: "Owner",
    });
  });

  it("updates a review for the author", async () => {
    vi.mocked(updateReview).mockResolvedValue(review);

    const response = await PATCH(
      new Request(`http://localhost:3000/api/reviews/${review.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          body: review.body,
          rating: review.rating,
        }),
      }),
      { params: Promise.resolve({ reviewId: review.id }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      data: {
        review: {
          id: review.id,
          body: review.body,
          rating: 4,
        },
      },
    });
    expect(updateReview).toHaveBeenCalledWith(
      review.id,
      {
        body: review.body,
        rating: review.rating,
      },
      review.authorId,
    );
  });

  it("returns FORBIDDEN when another user edits a review", async () => {
    vi.mocked(updateReview).mockRejectedValue(
      forbidden("Only the review author can update this review."),
    );

    const response = await PATCH(
      new Request(`http://localhost:3000/api/reviews/${review.id}`, {
        method: "PATCH",
        body: JSON.stringify({ body: "Not mine" }),
      }),
      { params: Promise.resolve({ reviewId: review.id }) },
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "FORBIDDEN",
      },
    });
  });

  it("deletes a review for the author", async () => {
    vi.mocked(deleteReview).mockResolvedValue(review);

    const response = await DELETE(
      new Request(`http://localhost:3000/api/reviews/${review.id}`, {
        method: "DELETE",
      }),
      { params: Promise.resolve({ reviewId: review.id }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      data: {
        review: {
          id: review.id,
        },
      },
    });
    expect(deleteReview).toHaveBeenCalledWith(review.id, review.authorId);
  });

  it("requires a signed-in user to update reviews", async () => {
    vi.mocked(requireCurrentUser).mockRejectedValue(authRequired());

    const response = await PATCH(
      new Request(`http://localhost:3000/api/reviews/${review.id}`, {
        method: "PATCH",
        body: JSON.stringify({ body: review.body }),
      }),
      { params: Promise.resolve({ reviewId: review.id }) },
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "AUTH_REQUIRED",
      },
    });
    expect(updateReview).not.toHaveBeenCalled();
  });
});
