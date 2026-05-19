import { describe, expect, it, vi } from "vitest";

import { requireCurrentUser } from "@/server/auth/current-user";

vi.mock("@/server/auth/auth", () => ({
  auth: vi.fn(),
}));

import { auth } from "@/server/auth/auth";

describe("requireCurrentUser", () => {
  it("returns the signed-in user id", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: "507f1f77bcf86cd799439011",
        email: "user@example.com",
        name: "Kushal",
      },
      expires: "2026-05-19T12:00:00.000Z",
    });

    await expect(requireCurrentUser()).resolves.toEqual({
      id: "507f1f77bcf86cd799439011",
      email: "user@example.com",
      name: "Kushal",
    });
  });

  it("throws AUTH_REQUIRED when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    await expect(requireCurrentUser()).rejects.toMatchObject({
      code: "AUTH_REQUIRED",
      status: 401,
    });
  });
});
