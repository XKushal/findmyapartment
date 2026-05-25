import { beforeEach, describe, expect, it, vi } from "vitest";

import { DELETE, POST } from "@/app/api/listings/[id]/save/route";
import {
  saveListing,
  unsaveListing,
} from "@/features/saved-listings/mutations";
import { authRequired } from "@/server/api/errors";
import { requireCurrentUser } from "@/server/auth/current-user";

vi.mock("@/features/saved-listings/mutations", () => ({
  saveListing: vi.fn(),
  unsaveListing: vi.fn(),
}));

vi.mock("@/server/auth/current-user", () => ({
  requireCurrentUser: vi.fn(),
}));

const userId = "507f1f77bcf86cd799439099";
const listingId = "507f1f77bcf86cd799439011";

describe("listing save APIs", () => {
  beforeEach(() => {
    vi.mocked(saveListing).mockReset();
    vi.mocked(unsaveListing).mockReset();
    vi.mocked(requireCurrentUser).mockResolvedValue({
      id: userId,
      email: "renter@example.com",
      name: "Renter",
    });
  });

  it("saves a listing for the signed-in user", async () => {
    const response = await POST(
      new Request(`http://localhost:3000/api/listings/${listingId}/save`, {
        method: "POST",
      }),
      { params: Promise.resolve({ id: listingId }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: {
        saved: true,
      },
    });
    expect(saveListing).toHaveBeenCalledWith(userId, listingId);
  });

  it("removes a saved listing for the signed-in user", async () => {
    const response = await DELETE(
      new Request(`http://localhost:3000/api/listings/${listingId}/save`, {
        method: "DELETE",
      }),
      { params: Promise.resolve({ id: listingId }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: {
        saved: false,
      },
    });
    expect(unsaveListing).toHaveBeenCalledWith(userId, listingId);
  });

  it("requires a signed-in user before saving", async () => {
    vi.mocked(requireCurrentUser).mockRejectedValue(authRequired());

    const response = await POST(
      new Request(`http://localhost:3000/api/listings/${listingId}/save`, {
        method: "POST",
      }),
      { params: Promise.resolve({ id: listingId }) },
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "AUTH_REQUIRED",
      },
    });
    expect(saveListing).not.toHaveBeenCalled();
  });
});
