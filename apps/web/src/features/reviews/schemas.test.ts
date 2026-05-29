import { describe, expect, it } from "vitest";

import {
  reviewCreateBodySchema,
  reviewUpdateBodySchema,
  serializeReview,
} from "@/features/reviews/schemas";

describe("review schemas", () => {
  it("trims create body text and defaults missing rating to null", () => {
    const result = reviewCreateBodySchema.safeParse({
      body: "  Helpful details about the unit.  ",
    });

    expect(result.success).toBe(true);
    expect(result.success ? result.data : null).toEqual({
      body: "Helpful details about the unit.",
      rating: null,
    });
  });

  it("rejects create ratings outside the 1-5 range", () => {
    expect(
      reviewCreateBodySchema.safeParse({
        body: "Useful review.",
        rating: 0,
      }).success,
    ).toBe(false);
    expect(
      reviewCreateBodySchema.safeParse({
        body: "Useful review.",
        rating: 6,
      }).success,
    ).toBe(false);
  });

  it("rejects empty review updates", () => {
    const result = reviewUpdateBodySchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("serializes review author display names with stable fallbacks", () => {
    const baseReview = {
      id: "review-1",
      listingId: "listing-1",
      authorId: "user-1",
      body: "Quiet building and responsive owner.",
      rating: 5,
      createdAt: new Date("2026-05-29T12:00:00.000Z"),
      updatedAt: new Date("2026-05-29T12:00:00.000Z"),
    };

    expect(
      serializeReview({
        ...baseReview,
        authorName: "Snapshot Name",
        author: { name: "Profile Name", email: "renter@example.com" },
      }).authorName,
    ).toBe("Snapshot Name");
    expect(
      serializeReview({
        ...baseReview,
        author: { name: "Profile Name", email: "renter@example.com" },
      }).authorName,
    ).toBe("Profile Name");
    expect(
      serializeReview({
        ...baseReview,
        author: { name: null, email: "renter@example.com" },
      }).authorName,
    ).toBe("renter@example.com");
    expect(
      serializeReview({
        ...baseReview,
        author: null,
      }).authorName,
    ).toBeNull();
  });
});
