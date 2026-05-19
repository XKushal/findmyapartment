import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/listings/[id]/route";
import { getListingById } from "@/features/listings/queries";

vi.mock("@/features/listings/queries", () => ({
  getListingById: vi.fn(),
}));

vi.mock("@/server/auth/current-user", () => ({
  requireCurrentUser: vi.fn(),
}));

const listing = {
  id: "507f1f77bcf86cd799439011",
  title: "Sunny room near SCSU",
  type: "ROOM" as const,
  status: "ACTIVE" as const,
  description: "Walkable room with utilities included.",
  rent: 650,
  deposit: null,
  utilitiesIncluded: true,
  availableFrom: null,
  leaseDuration: "12 months",
  address: null,
  distanceToCampus: "0.5 miles",
  contactEmail: null,
  contactPhone: null,
  bedrooms: 1,
  bathrooms: 1,
  petPolicy: "UNKNOWN" as const,
  amenities: ["Laundry"],
  imageUrls: [],
  ownerId: null,
  createdAt: new Date("2026-05-18T12:00:00.000Z"),
  updatedAt: new Date("2026-05-18T12:00:00.000Z"),
};

describe("GET /api/listings/{id}", () => {
  beforeEach(() => {
    vi.mocked(getListingById).mockReset();
  });

  it("returns a listing in the success envelope", async () => {
    vi.mocked(getListingById).mockResolvedValue(listing);

    const response = await GET(new Request("http://localhost:3000"), {
      params: Promise.resolve({ id: listing.id }),
    });

    await expect(response.json()).resolves.toEqual({
      data: {
        listing: {
          ...listing,
          availableFrom: null,
          createdAt: "2026-05-18T12:00:00.000Z",
          updatedAt: "2026-05-18T12:00:00.000Z",
        },
      },
    });
    expect(response.status).toBe(200);
    expect(getListingById).toHaveBeenCalledWith(listing.id);
  });

  it("returns a structured not-found error", async () => {
    vi.mocked(getListingById).mockResolvedValue(null);

    const response = await GET(new Request("http://localhost:3000"), {
      params: Promise.resolve({ id: listing.id }),
    });

    await expect(response.json()).resolves.toEqual({
      error: {
        code: "LISTING_NOT_FOUND",
        message: "Listing was not found.",
        status: 404,
        details: { id: listing.id },
      },
    });
    expect(response.status).toBe(404);
  });
});
