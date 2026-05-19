import { describe, expect, it, vi } from "vitest";

import EditListingPage from "@/app/listings/[id]/edit/page";
import { getListingById } from "@/features/listings/queries";
import { auth } from "@/server/auth/auth";

vi.mock("@/features/listings/queries", () => ({
  getListingById: vi.fn(),
}));

vi.mock("@/server/auth/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("not-found");
  }),
  redirect: vi.fn((url: string) => {
    throw new Error(`redirect:${url}`);
  }),
}));

describe("EditListingPage", () => {
  it("redirects signed-out users to login with a callback", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    await expect(
      EditListingPage({
        params: Promise.resolve({ id: "507f1f77bcf86cd799439011" }),
      }),
    ).rejects.toThrow(
      "redirect:/login?callbackUrl=%2Flistings%2F507f1f77bcf86cd799439011%2Fedit",
    );

    expect(getListingById).not.toHaveBeenCalled();
  });
});
