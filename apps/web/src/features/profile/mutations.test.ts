import { beforeEach, describe, expect, it, vi } from "vitest";

import { updateProfileUser } from "@/features/profile/mutations";
import { prisma } from "@/server/db/prisma";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    user: {
      update: vi.fn(),
    },
  },
}));

describe("profile mutations", () => {
  beforeEach(() => {
    vi.mocked(prisma.user.update).mockReset();
    process.env.DATABASE_URL = "mongodb://example.test/allapartments";
  });

  it("updates safe account basics and contact defaults", async () => {
    vi.mocked(prisma.user.update).mockResolvedValue({
      id: "507f1f77bcf86cd799439099",
      email: "owner@example.com",
      name: "Kushal Singh",
      contactEmail: "renter@example.com",
      contactPhone: "320-555-1212",
      createdAt: new Date("2026-05-01T12:00:00.000Z"),
    });

    const profileUser = await updateProfileUser("507f1f77bcf86cd799439099", {
      name: "Kushal Singh",
      contactEmail: "renter@example.com",
      contactPhone: "320-555-1212",
    });

    expect(profileUser).toEqual({
      id: "507f1f77bcf86cd799439099",
      email: "owner@example.com",
      name: "Kushal Singh",
      contactEmail: "renter@example.com",
      contactPhone: "320-555-1212",
      createdAt: new Date("2026-05-01T12:00:00.000Z"),
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: {
        id: "507f1f77bcf86cd799439099",
      },
      data: {
        name: "Kushal Singh",
        contactEmail: "renter@example.com",
        contactPhone: "320-555-1212",
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
