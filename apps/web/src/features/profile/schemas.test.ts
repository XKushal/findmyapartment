import { describe, expect, it } from "vitest";

import { profileUpdateBodySchema } from "@/features/profile/schemas";

describe("profile schemas", () => {
  it("accepts display name and optional contact defaults", () => {
    const result = profileUpdateBodySchema.safeParse({
      name: " Kushal Singh ",
      contactEmail: " renter@example.com ",
      contactPhone: " 320-555-1212 ",
    });

    expect(result.success).toBe(true);
    expect(result.success ? result.data : null).toEqual({
      name: "Kushal Singh",
      contactEmail: "renter@example.com",
      contactPhone: "320-555-1212",
    });
  });

  it("rejects empty profile updates", () => {
    const result = profileUpdateBodySchema.safeParse({});

    expect(result.success).toBe(false);
  });
});
