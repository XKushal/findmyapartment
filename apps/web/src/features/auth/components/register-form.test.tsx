import { describe, expect, it, vi } from "vitest";

import { submitRegistration } from "@/features/auth/components/register-form";

describe("submitRegistration", () => {
  it("returns success after registering and signing in", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 201 }));
    const signInFn = vi.fn().mockResolvedValue({ error: null });

    await expect(
      submitRegistration({
        callbackUrl: "/profile",
        email: "renter@example.com",
        fetcher,
        name: "Renter One",
        password: "Password1",
        signInFn,
      }),
    ).resolves.toEqual({ ok: true });
  });

  it("uses API error messages when registration fails", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      Response.json(
        { error: { message: "An account with this email already exists." } },
        { status: 409 },
      ),
    );
    const signInFn = vi.fn();

    await expect(
      submitRegistration({
        callbackUrl: "/profile",
        email: "renter@example.com",
        fetcher,
        name: "Renter One",
        password: "Password1",
        signInFn,
      }),
    ).resolves.toEqual({
      ok: false,
      error: "An account with this email already exists.",
    });
    expect(signInFn).not.toHaveBeenCalled();
  });

  it("reports manual sign-in when automatic sign-in fails", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 201 }));
    const signInFn = vi.fn().mockResolvedValue({ error: "CredentialsSignin" });

    await expect(
      submitRegistration({
        callbackUrl: "/profile",
        email: "renter@example.com",
        fetcher,
        name: "Renter One",
        password: "Password1",
        signInFn,
      }),
    ).resolves.toEqual({
      ok: false,
      error: "Account created, but sign-in failed. Please sign in manually.",
    });
  });

  it("maps thrown registration failures to a retry message", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("Network failure"));
    const signInFn = vi.fn();

    await expect(
      submitRegistration({
        callbackUrl: "/profile",
        email: "renter@example.com",
        fetcher,
        name: "Renter One",
        password: "Password1",
        signInFn,
      }),
    ).resolves.toEqual({
      ok: false,
      error: "Could not create your account. Please try again.",
    });
  });
});
