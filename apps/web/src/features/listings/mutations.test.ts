import { ListingStatus } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { setListingStatus } from "@/features/listings/mutations";
import { prisma } from "@/server/db/prisma";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    listing: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const listingId = "507f1f77bcf86cd799439011";
const ownerId = "507f1f77bcf86cd799439099";

describe("listing mutations", () => {
  beforeEach(() => {
    vi.mocked(prisma.listing.findUnique).mockReset();
    vi.mocked(prisma.listing.update).mockReset();
    process.env.DATABASE_URL = "mongodb://example.test/allapartments";
  });

  it("lets the owner reactivate an archived listing", async () => {
    vi.mocked(prisma.listing.findUnique).mockResolvedValue({
      id: listingId,
      ownerId,
    });
    vi.mocked(prisma.listing.update).mockResolvedValue({
      id: listingId,
      status: ListingStatus.ACTIVE,
    });

    await setListingStatus(listingId, ListingStatus.ACTIVE, ownerId);

    expect(prisma.listing.findUnique).toHaveBeenCalledWith({
      where: {
        id: listingId,
      },
      select: {
        id: true,
        ownerId: true,
      },
    });
    expect(prisma.listing.update).toHaveBeenCalledWith({
      where: {
        id: listingId,
      },
      data: {
        status: ListingStatus.ACTIVE,
      },
    });
  });

  it("rejects status changes from non-owners", async () => {
    vi.mocked(prisma.listing.findUnique).mockResolvedValue({
      id: listingId,
      ownerId: "507f1f77bcf86cd799439088",
    });

    await expect(
      setListingStatus(listingId, ListingStatus.RENTED, ownerId),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      status: 403,
    });
    expect(prisma.listing.update).not.toHaveBeenCalled();
  });
});
