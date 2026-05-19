import { describe, expect, it } from "vitest";

import { resolveAuthCallbackUrl } from "@/features/auth/callback-url";

describe("resolveAuthCallbackUrl", () => {
  it("keeps safe local callback urls", () => {
    expect(resolveAuthCallbackUrl("/listings/new")).toBe("/listings/new");
  });

  it("falls back for missing or external callback urls", () => {
    expect(resolveAuthCallbackUrl(undefined)).toBe("/listings");
    expect(resolveAuthCallbackUrl("https://example.com/phish")).toBe("/listings");
  });
});
