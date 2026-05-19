import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "@/features/auth/password";

describe("password helpers", () => {
  it("hashes and verifies passwords", async () => {
    const hash = await hashPassword("Password1");

    expect(hash).not.toBe("Password1");
    await expect(verifyPassword("Password1", hash)).resolves.toBe(true);
    await expect(verifyPassword("Wrongpass1", hash)).resolves.toBe(false);
  });
});
