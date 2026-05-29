import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createReview,
  deleteReview,
  getReviewsForListing,
  updateReview,
} from "@/features/reviews/mutations";
import { prisma } from "@/server/db/prisma";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    listing: {
      findUnique: vi.fn(),
    },
    review: {
      create: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const reviewId = "507f1f77bcf86cd799439111";
const listingId = "507f1f77bcf86cd799439011";
const authorId = "507f1f77bcf86cd799439099";

describe("review mutations", () => {
  beforeEach(() => {
    vi.mocked(prisma.review.create).mockReset();
    vi.mocked(prisma.review.delete).mockReset();
    vi.mocked(prisma.review.findMany).mockReset();
    vi.mocked(prisma.review.findUnique).mockReset();
    vi.mocked(prisma.review.update).mockReset();
    vi.mocked(prisma.listing.findUnique).mockReset();
    process.env.DATABASE_URL = "mongodb://example.test/allapartments";
  });

  it("reads listing reviews newest first with author display data", async () => {
    vi.mocked(prisma.review.findMany).mockResolvedValue([]);

    await getReviewsForListing(listingId);

    expect(prisma.review.findMany).toHaveBeenCalledWith({
      where: {
        listingId,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  });

  it("creates a review connected to the listing and signed-in author", async () => {
    vi.mocked(prisma.listing.findUnique).mockResolvedValue({
      id: listingId,
      ownerId: "507f1f77bcf86cd799439088",
    });
    vi.mocked(prisma.review.create).mockResolvedValue({});

    await createReview(
      listingId,
      {
        body: "Accurate listing and quick reply.",
        rating: 5,
      },
      authorId,
    );

    expect(prisma.review.create).toHaveBeenCalledWith({
      data: {
        body: "Accurate listing and quick reply.",
        rating: 5,
        listing: {
          connect: {
            id: listingId,
          },
        },
        author: {
          connect: {
            id: authorId,
          },
        },
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  });

  it("blocks listing owners from reviewing their own listings", async () => {
    vi.mocked(prisma.listing.findUnique).mockResolvedValue({
      id: listingId,
      ownerId: authorId,
    });

    await expect(
      createReview(
        listingId,
        {
          body: "Reviewing my own listing.",
          rating: 5,
        },
        authorId,
      ),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    expect(prisma.review.create).not.toHaveBeenCalled();
  });

  it("blocks updates from users who did not author the review", async () => {
    vi.mocked(prisma.review.findUnique).mockResolvedValue({
      id: reviewId,
      authorId: "507f1f77bcf86cd799439088",
    });

    await expect(
      updateReview(reviewId, { body: "Not mine" }, authorId),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    expect(prisma.review.update).not.toHaveBeenCalled();
  });

  it("updates reviews owned by the signed-in author", async () => {
    vi.mocked(prisma.review.findUnique).mockResolvedValue({
      id: reviewId,
      authorId,
    });
    vi.mocked(prisma.review.update).mockResolvedValue({});

    await updateReview(reviewId, { body: "Updated", rating: 4 }, authorId);

    expect(prisma.review.update).toHaveBeenCalledWith({
      where: {
        id: reviewId,
      },
      data: {
        body: "Updated",
        rating: 4,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  });

  it("deletes reviews owned by the signed-in author", async () => {
    vi.mocked(prisma.review.findUnique).mockResolvedValue({
      id: reviewId,
      authorId,
    });
    vi.mocked(prisma.review.delete).mockResolvedValue({});

    await deleteReview(reviewId, authorId);

    expect(prisma.review.delete).toHaveBeenCalledWith({
      where: {
        id: reviewId,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  });
});
