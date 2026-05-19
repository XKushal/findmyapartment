import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/auth/register/route";
import { registerUser } from "@/features/auth/users";

vi.mock("@/features/auth/users", () => ({
  registerUser: vi.fn(),
}));

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.mocked(registerUser).mockReset();
  });

  it("registers a user with a valid request body", async () => {
    vi.mocked(registerUser).mockResolvedValue({
      id: "507f1f77bcf86cd799439011",
      email: "user@example.com",
      name: "Kushal",
      image: null,
    });

    const response = await POST(
      new Request("http://localhost:3000/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: "USER@example.COM",
          name: "Kushal",
          password: "Password1",
        }),
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      data: {
        user: {
          id: "507f1f77bcf86cd799439011",
          email: "user@example.com",
          name: "Kushal",
          image: null,
        },
      },
    });
    expect(registerUser).toHaveBeenCalledWith({
      email: "user@example.com",
      name: "Kushal",
      password: "Password1",
    });
  });

  it("returns validation errors for weak passwords", async () => {
    const response = await POST(
      new Request("http://localhost:3000/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: "user@example.com",
          name: "Kushal",
          password: "password",
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
    expect(registerUser).not.toHaveBeenCalled();
  });
});
