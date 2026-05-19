import { beforeEach, describe, expect, it, vi } from "vitest";

import { PATCH } from "@/app/api/profile/route";
import { updateProfileUser } from "@/features/profile/mutations";
import { requireCurrentUser } from "@/server/auth/current-user";

vi.mock("@/features/profile/mutations", () => ({
  updateProfileUser: vi.fn(),
}));

vi.mock("@/server/auth/current-user", () => ({
  requireCurrentUser: vi.fn(),
}));

describe("PATCH /api/profile", () => {
  beforeEach(() => {
    vi.mocked(updateProfileUser).mockReset();
    vi.mocked(requireCurrentUser).mockResolvedValue({
      id: "507f1f77bcf86cd799439099",
      email: "owner@example.com",
      name: "Owner Name",
    });
  });

  it("updates profile account basics for the signed-in user", async () => {
    vi.mocked(updateProfileUser).mockResolvedValue({
      id: "507f1f77bcf86cd799439099",
      email: "owner@example.com",
      name: "Kushal Singh",
      contactEmail: "renter@example.com",
      contactPhone: "320-555-1212",
      createdAt: new Date("2026-05-01T12:00:00.000Z"),
    });

    const response = await PATCH(
      new Request("http://localhost:3000/api/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: "Kushal Singh",
          contactEmail: "renter@example.com",
          contactPhone: "320-555-1212",
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      data: {
        user: {
          id: "507f1f77bcf86cd799439099",
          name: "Kushal Singh",
          contactEmail: "renter@example.com",
          contactPhone: "320-555-1212",
        },
      },
    });
    expect(updateProfileUser).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439099",
      {
        name: "Kushal Singh",
        contactEmail: "renter@example.com",
        contactPhone: "320-555-1212",
      },
    );
  });

  it("returns validation errors for invalid contact defaults", async () => {
    const response = await PATCH(
      new Request("http://localhost:3000/api/profile", {
        method: "PATCH",
        body: JSON.stringify({
          contactEmail: "not-an-email",
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
    expect(updateProfileUser).not.toHaveBeenCalled();
  });
});
