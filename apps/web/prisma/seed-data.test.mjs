import { describe, expect, it, vi } from "vitest";

import {
  DEV_LISTINGS,
  DEV_REVIEWS,
  DEV_USERS,
  seedDevData,
} from "./seed-data.mjs";

function createPrismaMock() {
  return {
    user: {
      upsert: vi.fn(),
    },
    listing: {
      upsert: vi.fn(),
    },
    review: {
      upsert: vi.fn(),
    },
  };
}

describe("dev seed data", () => {
  it("defines multiple local accounts, listings, and reviews", () => {
    expect(DEV_USERS).toHaveLength(3);
    expect(DEV_LISTINGS.length).toBeGreaterThanOrEqual(4);
    expect(DEV_REVIEWS.length).toBeGreaterThanOrEqual(4);
    expect(DEV_USERS.map((user) => user.email)).toEqual([
      "owner.one@example.com",
      "owner.two@example.com",
      "renter.one@example.com",
    ]);
  });

  it("upserts users, listings, and reviews with stable ids", async () => {
    const prisma = createPrismaMock();
    const hashPassword = vi.fn(async (password) => `hashed:${password}`);

    await seedDevData({ prisma, hashPassword });

    expect(prisma.user.upsert).toHaveBeenCalledTimes(DEV_USERS.length);
    expect(prisma.listing.upsert).toHaveBeenCalledTimes(DEV_LISTINGS.length);
    expect(prisma.review.upsert).toHaveBeenCalledTimes(DEV_REVIEWS.length);
    expect(hashPassword).toHaveBeenCalledTimes(DEV_USERS.length);

    expect(prisma.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: DEV_USERS[0].id },
        create: expect.objectContaining({
          id: DEV_USERS[0].id,
          email: DEV_USERS[0].email,
          passwordHash: "hashed:Password123!",
        }),
        update: expect.objectContaining({
          email: DEV_USERS[0].email,
          passwordHash: "hashed:Password123!",
        }),
      }),
    );

    expect(prisma.listing.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: DEV_LISTINGS[0].id },
        create: expect.objectContaining({
          id: DEV_LISTINGS[0].id,
          owner: {
            connect: {
              id: DEV_LISTINGS[0].ownerId,
            },
          },
        }),
        update: expect.objectContaining({
          owner: {
            connect: {
              id: DEV_LISTINGS[0].ownerId,
            },
          },
        }),
      }),
    );

    expect(prisma.review.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: DEV_REVIEWS[0].id },
        create: expect.objectContaining({
          id: DEV_REVIEWS[0].id,
          listing: {
            connect: {
              id: DEV_REVIEWS[0].listingId,
            },
          },
          author: {
            connect: {
              id: DEV_REVIEWS[0].authorId,
            },
          },
        }),
      }),
    );
  });
});
