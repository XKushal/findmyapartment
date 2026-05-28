import { beforeEach, describe, expect, it, vi } from "vitest";

import { createContactRequest } from "@/features/contact-requests/mutations";
import { prisma } from "@/server/db/prisma";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    listing: {
      findUnique: vi.fn(),
    },
    contactRequest: {
      create: vi.fn(),
    },
  },
}));

const input = {
  message: "I would like to tour this week.",
  preferredContactMethod: "EMAIL" as const,
  contactEmail: "renter@example.com",
  contactPhone: null,
};

describe("contact request mutations", () => {
  beforeEach(() => {
    vi.stubEnv("DATABASE_URL", "mongodb://example");
    vi.mocked(prisma.listing.findUnique).mockReset();
    vi.mocked(prisma.contactRequest.create).mockReset();
  });

  it("creates a contact request for the listing owner", async () => {
    vi.mocked(prisma.listing.findUnique).mockResolvedValue({
      id: "listing-1",
      ownerId: "owner-1",
    });
    vi.mocked(prisma.contactRequest.create).mockResolvedValue({
      id: "request-1",
    });

    await createContactRequest("listing-1", "renter-1", input);

    expect(prisma.contactRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          message: "I would like to tour this week.",
          preferredContactMethod: "EMAIL",
          contactEmail: "renter@example.com",
          contactPhone: null,
          listing: { connect: { id: "listing-1" } },
          requester: { connect: { id: "renter-1" } },
          owner: { connect: { id: "owner-1" } },
        },
      }),
    );
  });

  it("throws listing not found when the listing does not exist", async () => {
    vi.mocked(prisma.listing.findUnique).mockResolvedValue(null);

    await expect(
      createContactRequest("missing-listing", "renter-1", input),
    ).rejects.toMatchObject({
      code: "LISTING_NOT_FOUND",
      status: 404,
    });
  });

  it("rejects owners contacting their own listing", async () => {
    vi.mocked(prisma.listing.findUnique).mockResolvedValue({
      id: "listing-1",
      ownerId: "owner-1",
    });

    await expect(
      createContactRequest("listing-1", "owner-1", input),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      status: 403,
    });
  });
});
