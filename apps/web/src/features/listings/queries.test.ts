import { beforeEach, describe, expect, it, vi } from "vitest";

import { getActiveListings, getListingsByOwner } from "@/features/listings/queries";
import { prisma } from "@/server/db/prisma";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    listing: {
      findMany: vi.fn(),
    },
  },
}));

describe("listing queries", () => {
  beforeEach(() => {
    vi.mocked(prisma.listing.findMany).mockReset();
    process.env.DATABASE_URL = "mongodb://example.test/allapartments";
  });

  it("keeps public listing reads limited to active listings", async () => {
    vi.mocked(prisma.listing.findMany).mockResolvedValue([]);

    await getActiveListings({ type: "ROOM" });

    expect(prisma.listing.findMany).toHaveBeenCalledWith({
      where: {
        status: "ACTIVE",
        type: "ROOM",
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  });

  it("applies indexed discovery filters for public listing reads", async () => {
    vi.mocked(prisma.listing.findMany).mockResolvedValue([]);

    await getActiveListings({
      type: "ROOM",
      rentMin: 700,
      rentMax: 1200,
      bedroomsMin: 1,
      bathroomsMin: 1.5,
      availableBy: "2026-08-01",
      petPolicy: "PETS_ALLOWED",
    });

    expect(prisma.listing.findMany).toHaveBeenCalledWith({
      where: {
        status: "ACTIVE",
        type: "ROOM",
        rent: {
          gte: 700,
          lte: 1200,
        },
        bedrooms: {
          gte: 1,
        },
        bathrooms: {
          gte: 1.5,
        },
        petPolicy: "PETS_ALLOWED",
        OR: [
          {
            availableFrom: null,
          },
          {
            availableFrom: {
              lte: new Date("2026-08-01T00:00:00.000Z"),
            },
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  });

  it("returns all statuses for owner profile listing management", async () => {
    vi.mocked(prisma.listing.findMany).mockResolvedValue([]);

    await getListingsByOwner("507f1f77bcf86cd799439099");

    expect(prisma.listing.findMany).toHaveBeenCalledWith({
      where: {
        ownerId: "507f1f77bcf86cd799439099",
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  });
});
