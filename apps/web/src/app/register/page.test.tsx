import { describe, expect, it, vi } from "vitest";

import RegisterPage from "@/app/register/page";
import { auth } from "@/server/auth/auth";

vi.mock("@/server/auth/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`redirect:${url}`);
  }),
}));

function includesText(node: unknown, text: string): boolean {
  if (typeof node === "string" || typeof node === "number") {
    return String(node).includes(text);
  }

  if (!node || typeof node !== "object") {
    return false;
  }

  return Object.values(node).some((value) => includesText(value, text));
}

describe("RegisterPage", () => {
  it("redirects signed-in users to the safe callback URL", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: "507f1f77bcf86cd799439099",
        email: "renter@example.com",
      },
      expires: "2026-06-01T00:00:00.000Z",
    });

    await expect(
      RegisterPage({
        searchParams: Promise.resolve({ callbackUrl: "/profile" }),
      }),
    ).rejects.toThrow("redirect:/profile");
  });

  it("renders the registration form for signed-out users", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const page = await RegisterPage({
      searchParams: Promise.resolve({ callbackUrl: "/profile" }),
    });

    expect(includesText(page, "Join AllApartments")).toBe(true);
    const form = (page.props.children as unknown[]).at(-1) as {
      props: { callbackUrl?: string };
    };
    expect(form.props.callbackUrl).toBe("/profile");
  });
});
