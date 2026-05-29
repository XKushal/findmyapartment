import { describe, expect, it, vi } from "vitest";

import { submitLogin } from "@/features/auth/components/login-form";

describe("submitLogin", () => {
  it("returns success when credentials sign-in succeeds", async () => {
    const signInFn = vi.fn().mockResolvedValue({ error: null });

    await expect(
      submitLogin({
        callbackUrl: "/profile",
        email: "renter@example.com",
        password: "Password1",
        signInFn,
      }),
    ).resolves.toEqual({ ok: true });
  });

  it("maps credentials errors to the invalid credentials message", async () => {
    const signInFn = vi.fn().mockResolvedValue({ error: "CredentialsSignin" });

    await expect(
      submitLogin({
        callbackUrl: "/profile",
        email: "renter@example.com",
        password: "wrong",
        signInFn,
      }),
    ).resolves.toEqual({
      ok: false,
      error: "Email or password is incorrect.",
    });
  });

  it("maps thrown sign-in failures to a retry message", async () => {
    const signInFn = vi.fn().mockRejectedValue(new Error("Network failure"));

    await expect(
      submitLogin({
        callbackUrl: "/profile",
        email: "renter@example.com",
        password: "Password1",
        signInFn,
      }),
    ).resolves.toEqual({
      ok: false,
      error: "Could not sign in. Please try again.",
    });
  });
});
