import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/listings/route";
import { getActiveListings } from "@/features/listings/queries";

vi.mock("@/features/listings/queries", () => ({
  getActiveListings: vi.fn(),
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
  petPolicy: "PETS_ALLOWED" as const,
  amenities: ["Laundry"],
  imageUrls: [],
  roommateCount: null,
  preferredGender: null,
  lifestyle: null,
  cleanliness: null,
  smokingPolicy: null,
  roommatePreferences: null,
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
    expect(getActiveListings).toHaveBeenCalledWith({
      type: "ROOM",
      rentMin: undefined,
      rentMax: undefined,
      bedroomsMin: undefined,
      bathroomsMin: undefined,
      availableBy: undefined,
      petPolicy: undefined,
    });
  });

  it("passes structured discovery filters to listing reads", async () => {
    vi.mocked(getActiveListings).mockResolvedValue([listing]);

    const response = await GET(
      new Request(
        "http://localhost:3000/api/listings?type=ROOM&rentMin=700&rentMax=1200&bedroomsMin=1&bathroomsMin=1.5&availableBy=2026-08-01&petPolicy=PETS_ALLOWED",
      ),
    );

    expect(response.status).toBe(200);
    expect(getActiveListings).toHaveBeenCalledWith({
      type: "ROOM",
      rentMin: 700,
      rentMax: 1200,
      bedroomsMin: 1,
      bathroomsMin: 1.5,
      availableBy: "2026-08-01",
      petPolicy: "PETS_ALLOWED",
    });
  });

  it("accepts min and max aliases for rent filters", async () => {
    vi.mocked(getActiveListings).mockResolvedValue([listing]);

    const response = await GET(
      new Request("http://localhost:3000/api/listings?min=1100&max=1600"),
    );

    expect(response.status).toBe(200);
    expect(getActiveListings).toHaveBeenCalledWith({
      type: undefined,
      rentMin: 1100,
      rentMax: 1600,
      bedroomsMin: undefined,
      bathroomsMin: undefined,
      availableBy: undefined,
      petPolicy: undefined,
    });
  });

  it("ignores empty trailing filter params instead of dropping valid filters", async () => {
    vi.mocked(getActiveListings).mockResolvedValue([listing]);

    const response = await GET(
      new Request(
        "http://localhost:3000/api/listings?rentMin=1000&rentMax=1600&type=&bedroomsMin=&bathroomsMin=&availableBy=&petPolicy=",
      ),
    );

    expect(response.status).toBe(200);
    expect(getActiveListings).toHaveBeenCalledWith({
      type: undefined,
      rentMin: 1000,
      rentMax: 1600,
      bedroomsMin: undefined,
      bathroomsMin: undefined,
      availableBy: undefined,
      petPolicy: undefined,
    });
  });

  it("uses a single non-empty filter when the rest are empty", async () => {
    vi.mocked(getActiveListings).mockResolvedValue([listing]);

    const response = await GET(
      new Request(
        "http://localhost:3000/api/listings?rentMin=&rentMax=&type=ROOM&bedroomsMin=&bathroomsMin=&availableBy=&petPolicy=",
      ),
    );

    expect(response.status).toBe(200);
    expect(getActiveListings).toHaveBeenCalledWith({
      type: "ROOM",
      rentMin: undefined,
      rentMax: undefined,
      bedroomsMin: undefined,
      bathroomsMin: undefined,
      availableBy: undefined,
      petPolicy: undefined,
    });
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
