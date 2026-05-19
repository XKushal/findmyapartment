import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/listings/route";
import { DELETE, PATCH } from "@/app/api/listings/[id]/route";
import {
  archiveListing,
  createListing,
  updateListing,
} from "@/features/listings/mutations";

vi.mock("@/features/listings/queries", () => ({
  getActiveListings: vi.fn(),
  getListingById: vi.fn(),
}));

vi.mock("@/features/listings/mutations", () => ({
  archiveListing: vi.fn(),
  createListing: vi.fn(),
  updateListing: vi.fn(),
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

describe("local listing write APIs", () => {
  beforeEach(() => {
    vi.mocked(archiveListing).mockReset();
    vi.mocked(createListing).mockReset();
    vi.mocked(updateListing).mockReset();
  });

  it("creates a listing from a valid request body", async () => {
    vi.mocked(createListing).mockResolvedValue(listing);

    const response = await POST(
      new Request("http://localhost:3000/api/listings", {
        method: "POST",
        body: JSON.stringify({
          title: listing.title,
          type: listing.type,
          description: listing.description,
          rent: listing.rent,
          utilitiesIncluded: listing.utilitiesIncluded,
          leaseDuration: listing.leaseDuration,
          distanceToCampus: listing.distanceToCampus,
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          amenities: listing.amenities,
          imageUrls: listing.imageUrls,
        }),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      data: {
        listing: {
          id: listing.id,
          title: listing.title,
          type: listing.type,
          status: listing.status,
        },
      },
    });
    expect(createListing).toHaveBeenCalledWith(
      expect.objectContaining({
        title: listing.title,
        type: listing.type,
        status: "ACTIVE",
      }),
    );
  });

  it("returns validation errors for invalid create bodies", async () => {
    const response = await POST(
      new Request("http://localhost:3000/api/listings", {
        method: "POST",
        body: JSON.stringify({
          title: "",
          type: "HOUSE",
          description: "",
          rent: -1,
        }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
        status: 400,
      },
    });
    expect(createListing).not.toHaveBeenCalled();
  });

  it("updates a listing from a valid patch body", async () => {
    vi.mocked(updateListing).mockResolvedValue({
      ...listing,
      rent: 700,
      updatedAt: new Date("2026-05-19T12:00:00.000Z"),
    });

    const response = await PATCH(
      new Request("http://localhost:3000/api/listings/507f1f77bcf86cd799439011", {
        method: "PATCH",
        body: JSON.stringify({ rent: 700 }),
      }),
      { params: Promise.resolve({ id: listing.id }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      data: {
        listing: {
          id: listing.id,
          rent: 700,
        },
      },
    });
    expect(updateListing).toHaveBeenCalledWith(listing.id, { rent: 700 });
  });

  it("returns a structured not-found error when updating a missing listing", async () => {
    vi.mocked(updateListing).mockResolvedValue(null);

    const response = await PATCH(
      new Request("http://localhost:3000/api/listings/507f1f77bcf86cd799439011", {
        method: "PATCH",
        body: JSON.stringify({ rent: 700 }),
      }),
      { params: Promise.resolve({ id: listing.id }) },
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "LISTING_NOT_FOUND",
        status: 404,
      },
    });
  });

  it("archives a listing through DELETE", async () => {
    vi.mocked(archiveListing).mockResolvedValue({
      ...listing,
      status: "ARCHIVED",
    });

    const response = await DELETE(
      new Request("http://localhost:3000/api/listings/507f1f77bcf86cd799439011", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ id: listing.id }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      data: {
        listing: {
          id: listing.id,
          status: "ARCHIVED",
        },
      },
    });
    expect(archiveListing).toHaveBeenCalledWith(listing.id);
  });
});
