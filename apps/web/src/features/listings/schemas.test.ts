import { describe, expect, it } from "vitest";

import {
  listingParamsSchema,
  listingQuerySchema,
  listingResponseSchema,
} from "@/features/listings/schemas";

describe("listing API schemas", () => {
  it("accepts a valid listing response payload", () => {
    const parsed = listingResponseSchema.parse({
      id: "507f1f77bcf86cd799439011",
      title: "Sunny room near SCSU",
      type: "ROOM",
      status: "ACTIVE",
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
      createdAt: "2026-05-18T12:00:00.000Z",
      updatedAt: "2026-05-18T12:00:00.000Z",
    });

    expect(parsed.type).toBe("ROOM");
  });

  it("rejects unsupported listing type filters", () => {
    const parsed = listingQuerySchema.safeParse({ type: "HOUSE" });

    expect(parsed.success).toBe(false);
  });

  it("requires a non-empty listing id path parameter", () => {
    const parsed = listingParamsSchema.safeParse({ id: "" });

    expect(parsed.success).toBe(false);
  });
});
