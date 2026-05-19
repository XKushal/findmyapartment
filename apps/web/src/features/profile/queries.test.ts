import { beforeEach, describe, expect, it, vi } from "vitest";

import { getProfileUser } from "@/features/profile/queries";
import { prisma } from "@/server/db/prisma";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe("profile queries", () => {
  beforeEach(() => {
    vi.mocked(prisma.user.findUnique).mockReset();
    process.env.DATABASE_URL = "mongodb://example.test/allapartments";
  });

  it("loads safe profile account fields for the signed-in user", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "507f1f77bcf86cd799439099",
      email: "owner@example.com",
      name: "Owner Name",
      contactEmail: "renter@example.com",
      contactPhone: "320-555-1212",
      createdAt: new Date("2026-05-01T12:00:00.000Z"),
    });

    const profileUser = await getProfileUser("507f1f77bcf86cd799439099");

    expect(profileUser).toEqual({
      id: "507f1f77bcf86cd799439099",
      email: "owner@example.com",
      name: "Owner Name",
      contactEmail: "renter@example.com",
      contactPhone: "320-555-1212",
      createdAt: new Date("2026-05-01T12:00:00.000Z"),
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        id: "507f1f77bcf86cd799439099",
      },
      select: {
        id: true,
        email: true,
        name: true,
        contactEmail: true,
        contactPhone: true,
        createdAt: true,
      },
    });
  });
});
