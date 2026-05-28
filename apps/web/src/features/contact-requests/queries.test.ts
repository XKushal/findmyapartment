import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getReceivedContactRequestsByOwner,
  getSentContactRequestsByRequester,
} from "@/features/contact-requests/queries";
import { prisma } from "@/server/db/prisma";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    contactRequest: {
      findMany: vi.fn(),
    },
  },
}));

describe("contact request queries", () => {
  beforeEach(() => {
    vi.mocked(prisma.contactRequest.findMany).mockReset();
  });

  it("returns an empty list without a database URL", async () => {
    vi.stubEnv("DATABASE_URL", "");

    await expect(getReceivedContactRequestsByOwner("owner-1")).resolves.toEqual(
      [],
    );
    await expect(
      getSentContactRequestsByRequester("renter-1"),
    ).resolves.toEqual([]);
    expect(prisma.contactRequest.findMany).not.toHaveBeenCalled();
  });

  it("reads received contact requests for owners", async () => {
    vi.stubEnv("DATABASE_URL", "mongodb://example");
    vi.mocked(prisma.contactRequest.findMany).mockResolvedValue([]);

    await getReceivedContactRequestsByOwner("owner-1");

    expect(prisma.contactRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ownerId: "owner-1" },
        orderBy: { createdAt: "desc" },
      }),
    );
  });

  it("reads sent contact requests for requesters", async () => {
    vi.stubEnv("DATABASE_URL", "mongodb://example");
    vi.mocked(prisma.contactRequest.findMany).mockResolvedValue([]);

    await getSentContactRequestsByRequester("renter-1");

    expect(prisma.contactRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { requesterId: "renter-1" },
        orderBy: { createdAt: "desc" },
      }),
    );
  });
});
