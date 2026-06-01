import { describe, expect, it } from "vitest";

import {
  LISTING_STATUS_NOTICE_TIMEOUT_MS,
  listingStatusActionLabels,
  listingStatusConfirmationCopy,
  listingStatusFeedbackClassName,
} from "@/features/listings/components/listing-status-actions";

describe("listing status actions", () => {
  it("offers lifecycle actions for each owner-facing status", () => {
    expect(listingStatusActionLabels("ACTIVE")).toEqual([
      "Mark rented",
      "Archive",
    ]);
    expect(listingStatusActionLabels("RENTED")).toEqual([
      "Reactivate",
      "Archive",
    ]);
    expect(listingStatusActionLabels("ARCHIVED")).toEqual(["Reactivate"]);
  });

  it("uses compact inline feedback for status updates", () => {
    expect(listingStatusFeedbackClassName("success")).toContain("text-xs");
    expect(listingStatusFeedbackClassName("success")).toContain("px-2");
    expect(listingStatusFeedbackClassName("success")).not.toContain("py-3");
  });

  it("uses app-owned confirmation copy instead of a browser-native prompt", () => {
    expect(listingStatusConfirmationCopy("RENTED")).toMatchObject({
      title: "Mark as rented?",
      body: "This removes the listing from public browsing but keeps it in your profile.",
      confirmLabel: "Mark rented",
    });
  });

  it("auto-dismisses success notices after a short delay", () => {
    expect(LISTING_STATUS_NOTICE_TIMEOUT_MS).toBeGreaterThan(1000);
    expect(LISTING_STATUS_NOTICE_TIMEOUT_MS).toBeLessThanOrEqual(4000);
  });
});
