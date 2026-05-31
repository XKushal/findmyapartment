import { describe, expect, it } from "vitest";

import { ListingCard } from "@/features/listings/components/listing-card";

function includesText(
  node: unknown,
  text: string,
  seen = new WeakSet<object>(),
): boolean {
  if (typeof node === "string" || typeof node === "number") {
    return String(node).includes(text);
  }

  if (!node || typeof node !== "object") {
    return false;
  }

  if (seen.has(node)) {
    return false;
  }
  seen.add(node);

  return Object.values(node).some((value) => includesText(value, text, seen));
}

const listing = {
  id: "507f1f77bcf86cd799439011",
  title: "Fall roommate lead",
  type: "ROOMMATE" as const,
  status: "ACTIVE" as const,
  description: "Looking for one roommate",
  rent: 575,
  deposit: null,
  utilitiesIncluded: true,
  availableFrom: null,
  leaseDuration: "Fall semester",
  address: null,
  distanceToCampus: "0.8 miles",
  contactEmail: "poster@example.com",
  contactPhone: null,
  bedrooms: 1,
  bathrooms: 1,
  petPolicy: "UNKNOWN" as const,
  amenities: [],
  imageUrls: [],
  roommateCount: 1,
  preferredGender: "No preference",
  lifestyle: "Quiet weekdays",
  cleanliness: "Shared chores weekly",
  smokingPolicy: "No smoking",
  roommatePreferences: "Graduate students preferred",
  ownerId: "507f1f77bcf86cd799439099",
  createdAt: new Date("2026-05-18T12:00:00.000Z"),
  updatedAt: new Date("2026-05-18T12:00:00.000Z"),
};

describe("ListingCard", () => {
  it("shows a compatibility cue for roommate listings", () => {
    const card = ListingCard({ listing });

    expect(includesText(card, "Quiet weekdays")).toBe(true);
  });

  it("uses a housing-specific empty image state when no photo exists", () => {
    const card = ListingCard({ listing });

    expect(includesText(card, "No photo yet")).toBe(true);
  });
});
