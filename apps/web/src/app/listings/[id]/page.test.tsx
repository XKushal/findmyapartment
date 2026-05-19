import { describe, expect, it, vi } from "vitest";

import ListingDetailPage from "@/app/listings/[id]/page";
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
}));

const listing = {
  id: "507f1f77bcf86cd799439011",
  title: "Sunny room near SCSU",
  type: "ROOM" as const,
  status: "ACTIVE" as const,
  description: "Walkable room with utilities included.",
  rent: 650,
  deposit: 500,
  utilitiesIncluded: true,
  availableFrom: new Date("2026-06-01T00:00:00.000Z"),
  leaseDuration: "12 months",
  address: "720 4th Ave S",
  distanceToCampus: "0.5 miles",
  contactEmail: "poster@example.com",
  contactPhone: "320-555-1212",
  bedrooms: 1,
  bathrooms: 1,
  amenities: ["Laundry"],
  imageUrls: ["data:image/png;base64,abc123"],
  ownerId: "507f1f77bcf86cd799439099",
  createdAt: new Date("2026-05-18T12:00:00.000Z"),
  updatedAt: new Date("2026-05-18T12:00:00.000Z"),
};

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

describe("ListingDetailPage", () => {
  it("shows edit controls for the listing owner", async () => {
    vi.mocked(getListingById).mockResolvedValue(listing);
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: "507f1f77bcf86cd799439099",
      },
      expires: "2026-06-01T00:00:00.000Z",
    });

    const page = await ListingDetailPage({
      params: Promise.resolve({ id: listing.id }),
    });

    expect(hasHref(page, `/listings/${listing.id}/edit`)).toBe(true);
  });
});
