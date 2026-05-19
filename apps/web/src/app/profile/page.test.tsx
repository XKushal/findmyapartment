import { describe, expect, it, vi } from "vitest";

import ProfilePage from "@/app/profile/page";
import { getListingsByOwner } from "@/features/listings/queries";
import { getProfileUser } from "@/features/profile/queries";
import { auth } from "@/server/auth/auth";

vi.mock("@/features/listings/queries", () => ({
  getListingsByOwner: vi.fn(),
}));

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

const ownerId = "507f1f77bcf86cd799439099";

const ownedListings = [
  {
    id: "507f1f77bcf86cd799439011",
    title: "Active room near SCSU",
    type: "ROOM" as const,
    status: "ACTIVE" as const,
    description: "Walkable room with utilities included.",
    rent: 650,
    deposit: null,
    utilitiesIncluded: true,
    availableFrom: null,
    leaseDuration: "12 months",
    address: null,
    distanceToCampus: "0.5 miles",
    contactEmail: null,
    contactPhone: null,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["Laundry"],
    imageUrls: [],
    ownerId,
    createdAt: new Date("2026-05-18T12:00:00.000Z"),
    updatedAt: new Date("2026-05-19T12:00:00.000Z"),
  },
  {
    id: "507f1f77bcf86cd799439012",
    title: "Archived studio",
    type: "APARTMENT" as const,
    status: "ARCHIVED" as const,
    description: "No longer available.",
    rent: 900,
    deposit: 900,
    utilitiesIncluded: false,
    availableFrom: null,
    leaseDuration: null,
    address: null,
    distanceToCampus: null,
    contactEmail: null,
    contactPhone: null,
    bedrooms: 0,
    bathrooms: 1,
    amenities: [],
    imageUrls: [],
    ownerId,
    createdAt: new Date("2026-05-18T12:00:00.000Z"),
    updatedAt: new Date("2026-05-20T12:00:00.000Z"),
  },
];

function includesText(node: unknown, text: string): boolean {
  if (typeof node === "string" || typeof node === "number") {
    return String(node).includes(text);
  }

  if (!node || typeof node !== "object") {
    return false;
  }

  const element = node as { props?: { children?: unknown } };
  const children = element.props?.children;

  if (Array.isArray(children)) {
    return children.some((child) => includesText(child, text));
  }

  return includesText(children, text);
}

function hasHref(node: unknown, href: string): boolean {
  if (!node || typeof node !== "object") {
    return false;
  }

  const element = node as {
    props?: { href?: unknown; children?: unknown };
  };

  if (element.props?.href === href) {
    return true;
  }

  const children = element.props?.children;

  if (Array.isArray(children)) {
    return children.some((child) => hasHref(child, href));
  }

  return hasHref(children, href);
}

describe("ProfilePage", () => {
  it("redirects signed-out users to login with a callback", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    await expect(Promise.resolve().then(() => ProfilePage())).rejects.toThrow(
      "redirect:/login?callbackUrl=%2Fprofile",
    );

    expect(getProfileUser).not.toHaveBeenCalled();
    expect(getListingsByOwner).not.toHaveBeenCalled();
  });

  it("renders the signed-in user's profile and all owned listing statuses", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: ownerId,
        email: "owner@example.com",
        name: "Owner Name",
      },
      expires: "2026-06-01T00:00:00.000Z",
    });
    vi.mocked(getProfileUser).mockResolvedValue({
      id: ownerId,
      email: "owner@example.com",
      name: "Owner Name",
      contactEmail: "renter@example.com",
      contactPhone: "320-555-1212",
      createdAt: new Date("2026-05-01T12:00:00.000Z"),
    });
    vi.mocked(getListingsByOwner).mockResolvedValue(ownedListings);

    const page = await ProfilePage();

    expect(getProfileUser).toHaveBeenCalledWith(ownerId);
    expect(getListingsByOwner).toHaveBeenCalledWith(ownerId);
    expect(includesText(page, "Owner Name")).toBe(true);
    expect(includesText(page, "owner@example.com")).toBe(true);
    expect(includesText(page, "Account basics")).toBe(true);
    expect(includesText(page, "Joined May 1, 2026")).toBe(true);
    expect(includesText(page, "Active room near SCSU")).toBe(true);
    expect(includesText(page, "Archived studio")).toBe(true);
    expect(includesText(page, "ARCHIVED")).toBe(true);
    expect(hasHref(page, "/listings/507f1f77bcf86cd799439011/edit")).toBe(true);
  });
});
