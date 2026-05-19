import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/listings/route";
import { getActiveListings } from "@/features/listings/queries";

vi.mock("@/features/listings/queries", () => ({
  getActiveListings: vi.fn(),
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
  bedrooms: 1,
  bathrooms: 1,
  amenities: ["Laundry"],
  imageUrls: [],
  ownerId: null,
  createdAt: new Date("2026-05-18T12:00:00.000Z"),
  updatedAt: new Date("2026-05-18T12:00:00.000Z"),
};

describe("GET /api/listings", () => {
  beforeEach(() => {
    vi.mocked(getActiveListings).mockReset();
  });

  it("returns active listings in the success envelope", async () => {
    vi.mocked(getActiveListings).mockResolvedValue([listing]);

    const response = await GET(
      new Request("http://localhost:3000/api/listings?type=ROOM"),
    );

    await expect(response.json()).resolves.toEqual({
      data: {
        listings: [
          {
            ...listing,
            availableFrom: null,
            createdAt: "2026-05-18T12:00:00.000Z",
            updatedAt: "2026-05-18T12:00:00.000Z",
          },
        ],
      },
    });
    expect(response.status).toBe(200);
    expect(getActiveListings).toHaveBeenCalledWith("ROOM");
  });

  it("returns a validation error for unsupported filters", async () => {
    const response = await GET(
      new Request("http://localhost:3000/api/listings?type=HOUSE"),
    );

    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
        status: 400,
      },
    });
    expect(getActiveListings).not.toHaveBeenCalled();
  });
});
