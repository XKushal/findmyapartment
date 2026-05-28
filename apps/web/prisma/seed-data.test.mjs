import { describe, expect, it, vi } from "vitest";

import {
  DEV_LISTINGS,
  DEV_CONTACT_REQUESTS,
  DEV_REVIEWS,
  DEV_SAVED_LISTINGS,
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
    savedListing: {
      upsert: vi.fn(),
    },
    contactRequest: {
      upsert: vi.fn(),
    },
  };
}

describe("dev seed data", () => {
  it("defines multiple local accounts, listings, and reviews", () => {
    const roommateListing = DEV_LISTINGS.find(
      (listing) => listing.type === "ROOMMATE",
    );

    expect(DEV_USERS).toHaveLength(3);
    expect(DEV_LISTINGS.length).toBeGreaterThanOrEqual(4);
    expect(DEV_REVIEWS.length).toBeGreaterThanOrEqual(4);
    expect(DEV_SAVED_LISTINGS.length).toBeGreaterThanOrEqual(2);
    expect(DEV_CONTACT_REQUESTS.length).toBeGreaterThanOrEqual(2);
    expect(roommateListing).toEqual(
      expect.objectContaining({
        roommateCount: 1,
        lifestyle: expect.any(String),
        roommatePreferences: expect.any(String),
      }),
    );
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
    expect(prisma.savedListing.upsert).toHaveBeenCalledTimes(
      DEV_SAVED_LISTINGS.length,
    );
    expect(prisma.contactRequest.upsert).toHaveBeenCalledTimes(
      DEV_CONTACT_REQUESTS.length,
    );
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

    expect(prisma.listing.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: DEV_LISTINGS[3].id },
        create: expect.objectContaining({
          roommateCount: 1,
          lifestyle: expect.any(String),
          roommatePreferences: expect.any(String),
        }),
        update: expect.objectContaining({
          roommateCount: 1,
          lifestyle: expect.any(String),
          roommatePreferences: expect.any(String),
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

    expect(prisma.savedListing.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: DEV_SAVED_LISTINGS[0].id },
        create: expect.objectContaining({
          id: DEV_SAVED_LISTINGS[0].id,
          user: {
            connect: {
              id: DEV_SAVED_LISTINGS[0].userId,
            },
          },
          listing: {
            connect: {
              id: DEV_SAVED_LISTINGS[0].listingId,
            },
          },
        }),
      }),
    );

    expect(prisma.contactRequest.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: DEV_CONTACT_REQUESTS[0].id },
        create: expect.objectContaining({
          id: DEV_CONTACT_REQUESTS[0].id,
          message: DEV_CONTACT_REQUESTS[0].message,
          listing: {
            connect: {
              id: DEV_CONTACT_REQUESTS[0].listingId,
            },
          },
          requester: {
            connect: {
              id: DEV_CONTACT_REQUESTS[0].requesterId,
            },
          },
          owner: {
            connect: {
              id: DEV_CONTACT_REQUESTS[0].ownerId,
            },
          },
        }),
      }),
    );
  });
});
