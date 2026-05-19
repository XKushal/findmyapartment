import { describe, expect, it, vi } from "vitest";

import NewListingPage from "@/app/listings/new/page";
import { auth } from "@/server/auth/auth";

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
});
