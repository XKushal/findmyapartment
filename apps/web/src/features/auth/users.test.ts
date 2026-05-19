import { beforeEach, describe, expect, it, vi } from "vitest";

import { hashPassword } from "@/features/auth/password";
import { registerUser, validateCredentials } from "@/features/auth/users";
import { prisma } from "@/server/db/prisma";

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe("auth user helpers", () => {
  beforeEach(() => {
    vi.mocked(prisma.user.create).mockReset();
    vi.mocked(prisma.user.findUnique).mockReset();
  });

  it("registers a user with a password hash", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "507f1f77bcf86cd799439011",
      email: "user@example.com",
      name: "Kushal",
      image: null,
      passwordHash: "hash",
      createdAt: new Date("2026-05-18T12:00:00.000Z"),
      updatedAt: new Date("2026-05-18T12:00:00.000Z"),
    });

    const user = await registerUser({
      email: "user@example.com",
      name: "Kushal",
      password: "Password1",
    });

    expect(user).toEqual({
      id: "507f1f77bcf86cd799439011",
      email: "user@example.com",
      name: "Kushal",
      image: null,
    });
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: "user@example.com",
        name: "Kushal",
        passwordHash: expect.any(String),
      }),
    });
  });

  it("rejects duplicate email registration", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "507f1f77bcf86cd799439011",
      email: "user@example.com",
      name: "Kushal",
      image: null,
      passwordHash: "hash",
      createdAt: new Date("2026-05-18T12:00:00.000Z"),
      updatedAt: new Date("2026-05-18T12:00:00.000Z"),
    });

    await expect(
      registerUser({
        email: "user@example.com",
        name: "Kushal",
        password: "Password1",
      }),
    ).rejects.toMatchObject({
      code: "EMAIL_ALREADY_EXISTS",
      status: 409,
    });
  });

  it("validates credentials against the stored hash", async () => {
    const passwordHash = await hashPassword("Password1");
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "507f1f77bcf86cd799439011",
      email: "user@example.com",
      name: "Kushal",
      image: null,
      passwordHash,
      createdAt: new Date("2026-05-18T12:00:00.000Z"),
      updatedAt: new Date("2026-05-18T12:00:00.000Z"),
    });

    const user = await validateCredentials({
      email: "user@example.com",
      password: "Password1",
    });

    expect(user?.email).toBe("user@example.com");
  });
});
