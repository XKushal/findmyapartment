import { describe, expect, it } from "vitest";

import {
  filterListingImageFiles,
  RoommateFitFields,
} from "@/features/listings/components/listing-create-form";

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

describe("filterListingImageFiles", () => {
  it("keeps supported images within the size limit", () => {
    const png = new File(["image"], "room.png", { type: "image/png" });
    const jpeg = new File(["image"], "room.jpg", { type: "image/jpeg" });

    expect(filterListingImageFiles([png, jpeg], 0)).toEqual({
      files: [png, jpeg],
      error: null,
    });
  });

  it("rejects unsupported image types", () => {
    const gif = new File(["image"], "room.gif", { type: "image/gif" });

    expect(filterListingImageFiles([gif], 0)).toEqual({
      files: [],
      error: "Only JPEG, PNG, and WebP images are supported.",
    });
  });

  it("rejects oversized images", () => {
    const oversized = new File(
      [new Uint8Array(2 * 1024 * 1024 + 1)],
      "large.png",
      { type: "image/png" },
    );

    expect(filterListingImageFiles([oversized], 0)).toEqual({
      files: [],
      error: "Each image must be 2 MB or smaller.",
    });
  });

  it("limits files to the remaining image slots", () => {
    const first = new File(["image"], "one.png", { type: "image/png" });
    const second = new File(["image"], "two.png", { type: "image/png" });

    expect(filterListingImageFiles([first, second], 4)).toEqual({
      files: [first],
      error: "Only 1 more image(s) can be added.",
    });
  });
});
