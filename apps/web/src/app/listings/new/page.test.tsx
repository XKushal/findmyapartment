import { describe, expect, it, vi } from "vitest";

import NewListingPage from "@/app/listings/new/page";
import { getProfileUser } from "@/features/profile/queries";
import { auth } from "@/server/auth/auth";

vi.mock("@/features/profile/queries", () => ({
  getProfileUser: vi.fn(),
}));

vi.mock("@/server/auth/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`redirect:${url}`);
  }),
}));

describe("NewListingPage", () => {
  it("redirects signed-out users to login with a callback", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    await expect(Promise.resolve().then(() => NewListingPage())).rejects.toThrow(
      "redirect:/login?callbackUrl=%2Flistings%2Fnew",
    );
  });

  it("uses profile contact defaults for new listing forms", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: "507f1f77bcf86cd799439099",
        email: "owner@example.com",
      },
      expires: "2026-06-01T00:00:00.000Z",
    });
    vi.mocked(getProfileUser).mockResolvedValue({
      id: "507f1f77bcf86cd799439099",
      email: "owner@example.com",
      name: "Owner Name",
      contactEmail: "renter@example.com",
      contactPhone: "320-555-1212",
      createdAt: new Date("2026-05-01T12:00:00.000Z"),
    });

    const page = await NewListingPage();
    const form = (page.props.children as unknown[]).at(-1) as {
      props: {
        defaultContactEmail?: string | null;
        defaultContactPhone?: string | null;
      };
    };

    expect(form.props.defaultContactEmail).toBe("renter@example.com");
    expect(form.props.defaultContactPhone).toBe("320-555-1212");
  });
});
