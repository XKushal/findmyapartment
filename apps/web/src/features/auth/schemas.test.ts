import { describe, expect, it } from "vitest";

import {
  loginBodySchema,
  registerBodySchema,
  safeUserSchema,
} from "@/features/auth/schemas";

describe("auth schemas", () => {
  it("normalizes registration email and validates password strength", () => {
    const parsed = registerBodySchema.parse({
      email: "USER@Example.COM ",
      name: "Kushal",
      password: "Password1",
    });

    expect(parsed).toEqual({
      email: "user@example.com",
      name: "Kushal",
      password: "Password1",
    });
  });

  it("rejects weak passwords", () => {
    const parsed = registerBodySchema.safeParse({
      email: "user@example.com",
      name: "Kushal",
      password: "password",
    });

    expect(parsed.success).toBe(false);
  });

  it("normalizes login email", () => {
    const parsed = loginBodySchema.parse({
      email: "USER@Example.COM ",
      password: "Password1",
    });

    expect(parsed.email).toBe("user@example.com");
  });

  it("omits password hashes from safe user responses", () => {
    const parsed = safeUserSchema.parse({
      id: "507f1f77bcf86cd799439011",
      email: "user@example.com",
      name: "Kushal",
      image: null,
    });

    expect(parsed).not.toHaveProperty("passwordHash");
  });
});
