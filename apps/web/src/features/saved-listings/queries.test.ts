import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getSavedListingIdsByUser,
  getSavedListingsByUser,
} from "@/features/saved-listings/queries";
import { prisma } from "@/server/db/prisma";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    savedListing: {
      findMany: vi.fn(),
    },
  },
}));

describe("saved listing queries", () => {
  beforeEach(() => {
    vi.mocked(prisma.savedListing.findMany).mockReset();
    process.env.DATABASE_URL = "mongodb://example.test/allapartments";
  });

  it("returns saved listing ids for the signed-in user", async () => {
    vi.mocked(prisma.savedListing.findMany).mockResolvedValue([
      { listingId: "507f1f77bcf86cd799439011" },
    ]);

    await expect(
      getSavedListingIdsByUser("507f1f77bcf86cd799439099"),
    ).resolves.toEqual(["507f1f77bcf86cd799439011"]);

    expect(prisma.savedListing.findMany).toHaveBeenCalledWith({
      where: {
        userId: "507f1f77bcf86cd799439099",
      },
      select: {
        listingId: true,
      },
    });
  });

  it("returns active saved listings newest-first for profile display", async () => {
    const listing = {
      id: "507f1f77bcf86cd799439011",
      title: "Saved room",
    };
    vi.mocked(prisma.savedListing.findMany).mockResolvedValue([{ listing }]);

    await expect(
      getSavedListingsByUser("507f1f77bcf86cd799439099"),
    ).resolves.toEqual([listing]);

    expect(prisma.savedListing.findMany).toHaveBeenCalledWith({
      where: {
        userId: "507f1f77bcf86cd799439099",
        listing: {
          status: "ACTIVE",
        },
      },
      include: {
        listing: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  });
});
