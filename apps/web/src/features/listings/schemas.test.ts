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
      petPolicy: "PETS_ALLOWED",
      amenities: ["Laundry"],
      imageUrls: [],
      ownerId: null,
      createdAt: "2026-05-18T12:00:00.000Z",
      updatedAt: "2026-05-18T12:00:00.000Z",
    });

    expect(parsed.type).toBe("ROOM");
  });

  it("accepts roommate-specific fields on listing responses", () => {
    const parsed = listingResponseSchema.parse({
      id: "507f1f77bcf86cd799439011",
      title: "Looking for a fall roommate",
      type: "ROOMMATE",
      status: "ACTIVE",
      description: "Shared lease near campus.",
      rent: 575,
      deposit: null,
      utilitiesIncluded: true,
      availableFrom: null,
      leaseDuration: "Fall semester",
      address: null,
      distanceToCampus: "0.8 miles",
      contactEmail: "poster@example.com",
      contactPhone: null,
      bedrooms: 1,
      bathrooms: 1,
      petPolicy: "UNKNOWN",
      amenities: ["Bus route"],
      imageUrls: [],
      roommateCount: 1,
      preferredGender: "No preference",
      lifestyle: "Quiet weekdays, social weekends",
      cleanliness: "Shared chores weekly",
      smokingPolicy: "No smoking",
      roommatePreferences: "Graduate students preferred",
      ownerId: null,
      createdAt: "2026-05-18T12:00:00.000Z",
      updatedAt: "2026-05-18T12:00:00.000Z",
    });

    expect(parsed.roommateCount).toBe(1);
    expect(parsed.lifestyle).toBe("Quiet weekdays, social weekends");
  });

  it("rejects unsupported listing type filters", () => {
    const parsed = listingQuerySchema.safeParse({ type: "HOUSE" });

    expect(parsed.success).toBe(false);
  });

  it("accepts structured discovery filters", () => {
    const parsed = listingQuerySchema.safeParse({
      type: "ROOM",
      rentMin: "700",
      rentMax: "1200",
      bedroomsMin: "1",
      bathroomsMin: "1.5",
      availableBy: "2026-08-01",
      petPolicy: "PETS_ALLOWED",
    });

    expect(parsed.success).toBe(true);
    expect(parsed.success ? parsed.data : null).toEqual({
      type: "ROOM",
      rentMin: 700,
      rentMax: 1200,
      bedroomsMin: 1,
      bathroomsMin: 1.5,
      availableBy: "2026-08-01",
      petPolicy: "PETS_ALLOWED",
    });
  });

  it("treats empty optional discovery filters as omitted", () => {
    const parsed = listingQuerySchema.safeParse({
      rentMin: "1000",
      rentMax: "1600",
      type: "",
      bedroomsMin: "",
      bathroomsMin: "",
      availableBy: "",
      petPolicy: "",
    });

    expect(parsed.success).toBe(true);
    expect(parsed.success ? parsed.data : null).toEqual({
      rentMin: 1000,
      rentMax: 1600,
      type: undefined,
      bedroomsMin: undefined,
      bathroomsMin: undefined,
      availableBy: undefined,
      petPolicy: undefined,
    });
  });

  it("rejects inverted rent filters", () => {
    const parsed = listingQuerySchema.safeParse({
      rentMin: "1400",
      rentMax: "900",
    });

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
      petPolicy: "PETS_ALLOWED",
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

  it("accepts optional roommate fields for listing writes", () => {
    const parsed = listingCreateBodySchema.safeParse({
      title: "Looking for a fall roommate",
      type: "ROOMMATE",
      description: "Shared lease near campus.",
      rent: 575,
      roommateCount: 1,
      preferredGender: "No preference",
      lifestyle: "Quiet weekdays, social weekends",
      cleanliness: "Shared chores weekly",
      smokingPolicy: "No smoking",
      roommatePreferences: "Graduate students preferred",
    });

    expect(parsed.success).toBe(true);
    expect(parsed.success ? parsed.data.roommateCount : null).toBe(1);
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
