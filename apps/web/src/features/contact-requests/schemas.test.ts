import { describe, expect, it } from "vitest";

import {
  contactRequestCreateBodySchema,
  contactRequestResponseSchema,
  serializeContactRequest,
} from "@/features/contact-requests/schemas";

describe("contact request schemas", () => {
  it("normalizes create payload contact fields", () => {
    expect(
      contactRequestCreateBodySchema.parse({
        message: "  I would like to tour this week.  ",
        preferredContactMethod: "EMAIL",
        contactEmail: " renter@example.com ",
        contactPhone: "",
      }),
    ).toEqual({
      message: "I would like to tour this week.",
      preferredContactMethod: "EMAIL",
      contactEmail: "renter@example.com",
      contactPhone: null,
    });
  });

  it("accepts serialized contact request responses", () => {
    const parsed = contactRequestResponseSchema.parse({
      id: "507f1f77bcf86cd799439011",
      listingId: "507f1f77bcf86cd799439012",
      listingTitle: "Sunny room near SCSU",
      requesterId: "507f1f77bcf86cd799439013",
      requesterName: "Renter One",
      requesterEmail: "renter@example.com",
      ownerId: "507f1f77bcf86cd799439014",
      ownerName: "Owner One",
      ownerEmail: "owner@example.com",
      message: "I would like to tour this week.",
      preferredContactMethod: "ANY",
      contactEmail: "renter@example.com",
      contactPhone: null,
      createdAt: "2026-05-28T12:00:00.000Z",
      updatedAt: "2026-05-28T12:00:00.000Z",
    });

    expect(parsed.listingTitle).toBe("Sunny room near SCSU");
  });

  it("serializes included listing and user summaries", () => {
    const serialized = serializeContactRequest({
      id: "507f1f77bcf86cd799439011",
      listingId: "507f1f77bcf86cd799439012",
      requesterId: "507f1f77bcf86cd799439013",
      ownerId: "507f1f77bcf86cd799439014",
      message: "I would like to tour this week.",
      preferredContactMethod: "PHONE",
      contactEmail: null,
      contactPhone: "320-555-0103",
      listing: {
        title: "Sunny room near SCSU",
      },
      requester: {
        name: "Renter One",
        email: "renter@example.com",
      },
      owner: {
        name: "Owner One",
        email: "owner@example.com",
      },
      createdAt: new Date("2026-05-28T12:00:00.000Z"),
      updatedAt: new Date("2026-05-28T12:00:00.000Z"),
    });

    expect(serialized).toEqual({
      id: "507f1f77bcf86cd799439011",
      listingId: "507f1f77bcf86cd799439012",
      listingTitle: "Sunny room near SCSU",
      requesterId: "507f1f77bcf86cd799439013",
      requesterName: "Renter One",
      requesterEmail: "renter@example.com",
      ownerId: "507f1f77bcf86cd799439014",
      ownerName: "Owner One",
      ownerEmail: "owner@example.com",
      message: "I would like to tour this week.",
      preferredContactMethod: "PHONE",
      contactEmail: null,
      contactPhone: "320-555-0103",
      createdAt: "2026-05-28T12:00:00.000Z",
      updatedAt: "2026-05-28T12:00:00.000Z",
    });
  });
});
