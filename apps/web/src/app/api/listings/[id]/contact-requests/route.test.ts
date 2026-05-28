import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/listings/[id]/contact-requests/route";
import { createContactRequest } from "@/features/contact-requests/mutations";
import { requireCurrentUser } from "@/server/auth/current-user";

vi.mock("@/features/contact-requests/mutations", () => ({
  createContactRequest: vi.fn(),
}));

vi.mock("@/server/auth/current-user", () => ({
  requireCurrentUser: vi.fn(),
}));

const contactRequest = {
  id: "request-1",
  listingId: "listing-1",
  requesterId: "renter-1",
  ownerId: "owner-1",
  message: "I would like to tour this week.",
  preferredContactMethod: "EMAIL" as const,
  contactEmail: "renter@example.com",
  contactPhone: null,
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
};

describe("POST /api/listings/{id}/contact-requests", () => {
  beforeEach(() => {
    vi.mocked(requireCurrentUser).mockReset();
    vi.mocked(createContactRequest).mockReset();
  });

  it("creates a contact request in the success envelope", async () => {
    vi.mocked(requireCurrentUser).mockResolvedValue({
      id: "renter-1",
      email: "renter@example.com",
      name: "Renter One",
    });
    vi.mocked(createContactRequest).mockResolvedValue(contactRequest);

    const response = await POST(
      new Request("http://localhost:3000/api/listings/listing-1/contact-requests", {
        method: "POST",
        body: JSON.stringify({
          message: "I would like to tour this week.",
          preferredContactMethod: "EMAIL",
          contactEmail: "renter@example.com",
          contactPhone: "",
        }),
      }),
      {
        params: Promise.resolve({ id: "listing-1" }),
      },
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      data: {
        contactRequest: {
          id: "request-1",
          listingId: "listing-1",
          listingTitle: "Sunny room near SCSU",
          requesterId: "renter-1",
          requesterName: "Renter One",
          requesterEmail: "renter@example.com",
          ownerId: "owner-1",
          ownerName: "Owner One",
          ownerEmail: "owner@example.com",
          message: "I would like to tour this week.",
          preferredContactMethod: "EMAIL",
          contactEmail: "renter@example.com",
          contactPhone: null,
          createdAt: "2026-05-28T12:00:00.000Z",
          updatedAt: "2026-05-28T12:00:00.000Z",
        },
      },
    });
    expect(createContactRequest).toHaveBeenCalledWith("listing-1", "renter-1", {
      message: "I would like to tour this week.",
      preferredContactMethod: "EMAIL",
      contactEmail: "renter@example.com",
      contactPhone: null,
    });
  });

  it("returns validation errors for invalid payloads", async () => {
    vi.mocked(requireCurrentUser).mockResolvedValue({
      id: "renter-1",
      email: "renter@example.com",
      name: "Renter One",
    });

    const response = await POST(
      new Request("http://localhost:3000/api/listings/listing-1/contact-requests", {
        method: "POST",
        body: JSON.stringify({
          message: "",
        }),
      }),
      {
        params: Promise.resolve({ id: "listing-1" }),
      },
    );

    expect(response.status).toBe(400);
    expect(createContactRequest).not.toHaveBeenCalled();
  });
});
