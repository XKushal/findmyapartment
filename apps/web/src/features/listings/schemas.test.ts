import { describe, expect, it } from "vitest";

import {
  listingCreateBodySchema,
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
      contactEmail: "poster@example.com",
      contactPhone: null,
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

  it("accepts uploaded image data urls for listing writes", () => {
    const parsed = listingCreateBodySchema.safeParse({
      title: "Sunny room",
      type: "ROOM",
      description: "Private room near campus.",
      rent: 850,
      imageUrls: ["data:image/png;base64,abc123"],
    });

    expect(parsed.success).toBe(true);
  });

  it("accepts optional contact fields for listing writes", () => {
    const parsed = listingCreateBodySchema.safeParse({
      title: "Sunny room",
      type: "ROOM",
      description: "Private room near campus.",
      rent: 850,
      contactEmail: "poster@example.com",
      contactPhone: "320-555-1212",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects invalid contact email values", () => {
    const parsed = listingCreateBodySchema.safeParse({
      title: "Sunny room",
      type: "ROOM",
      description: "Private room near campus.",
      rent: 850,
      contactEmail: "not-an-email",
    });

    expect(parsed.success).toBe(false);
  });
});
