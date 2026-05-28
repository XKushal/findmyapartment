import { describe, expect, it } from "vitest";

import { RoommateFitFields } from "@/features/listings/components/listing-create-form";

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

describe("RoommateFitFields", () => {
  it("shows roommate fit fields with edit defaults", () => {
    const fields = RoommateFitFields({
      listing: {
        roommateCount: 1,
        preferredGender: "No preference",
        lifestyle: "Quiet weekdays",
        cleanliness: "Shared chores weekly",
        smokingPolicy: "No smoking",
        roommatePreferences: "Graduate students preferred",
      },
    });

    expect(includesText(fields, "Roommate fit")).toBe(true);
    expect(includesText(fields, "Preferred gender")).toBe(true);
    expect(includesText(fields, "Graduate students preferred")).toBe(true);
  });
});
