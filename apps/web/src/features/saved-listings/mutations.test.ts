import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  saveListing,
  unsaveListing,
} from "@/features/saved-listings/mutations";
import { prisma } from "@/server/db/prisma";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    savedListing: {
      deleteMany: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

const userId = "507f1f77bcf86cd799439099";
const listingId = "507f1f77bcf86cd799439011";

describe("saved listing mutations", () => {
  beforeEach(() => {
    vi.mocked(prisma.savedListing.deleteMany).mockReset();
    vi.mocked(prisma.savedListing.upsert).mockReset();
    process.env.DATABASE_URL = "mongodb://example.test/allapartments";
  });

  it("saves a listing idempotently for a user", async () => {
    vi.mocked(prisma.savedListing.upsert).mockResolvedValue({
      id: "507f1f77bcf86cd799439222",
      userId,
      listingId,
      createdAt: new Date("2026-05-20T12:00:00.000Z"),
    });

    await saveListing(userId, listingId);

    expect(prisma.savedListing.upsert).toHaveBeenCalledWith({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
      create: {
        user: {
          connect: {
            id: userId,
          },
        },
        listing: {
          connect: {
            id: listingId,
          },
        },
      },
      update: {},
    });
  });

  it("removes a saved listing without requiring an existing row", async () => {
    vi.mocked(prisma.savedListing.deleteMany).mockResolvedValue({ count: 0 });

    await expect(unsaveListing(userId, listingId)).resolves.toEqual({
      saved: false,
    });

    expect(prisma.savedListing.deleteMany).toHaveBeenCalledWith({
      where: {
        userId,
        listingId,
      },
    });
  });
});
