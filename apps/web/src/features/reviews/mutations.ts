import { forbidden } from "@/server/api/errors";
import { prisma } from "@/server/db/prisma";

import {
  type ReviewCreateInput,
  type ReviewUpdateInput,
} from "./schemas";

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

const reviewInclude = {
  author: {
    select: {
      name: true,
      email: true,
    },
  },
};

export async function getReviewsForListing(listingId: string) {
  if (!hasDatabaseUrl()) {
    return [];
  }

  return prisma.review.findMany({
    where: {
      listingId,
    },
    include: reviewInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createReview(
  listingId: string,
  input: ReviewCreateInput,
  authorId: string,
) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  const listing = await prisma.listing.findUnique({
    where: {
      id: listingId,
    },
    select: {
      id: true,
      ownerId: true,
    },
  });

  if (listing?.ownerId === authorId) {
    throw forbidden("Listing owners cannot review their own listings.");
  }

  return prisma.review.create({
    data: {
      body: input.body,
      rating: input.rating,
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
    include: reviewInclude,
  });
}

export async function updateReview(
  reviewId: string,
  input: ReviewUpdateInput,
  authorId: string,
) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  const existing = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
    select: {
      id: true,
      authorId: true,
    },
  });

  if (!existing) {
    return null;
  }

  if (existing.authorId !== authorId) {
    throw forbidden("Only the review author can update this review.");
  }

  return prisma.review.update({
    where: {
      id: reviewId,
    },
    data: input,
    include: reviewInclude,
  });
}

export async function deleteReview(reviewId: string, authorId: string) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  const existing = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
    select: {
      id: true,
      authorId: true,
    },
  });

  if (!existing) {
    return null;
  }

  if (existing.authorId !== authorId) {
    throw forbidden("Only the review author can delete this review.");
  }

  return prisma.review.delete({
    where: {
      id: reviewId,
    },
    include: reviewInclude,
  });
}
