import { describe, expect, it } from "vitest";

import { createListingPayloadFromFormData } from "@/features/listings/form-payload";

describe("createListingPayloadFromFormData", () => {
  it("normalizes listing form data for the create endpoint", () => {
    const formData = new FormData();
    formData.set("title", "  Near SCSU  ");
    formData.set("type", "ROOM");
    formData.set("description", "Private room near campus");
    formData.set("rent", "850");
    formData.set("deposit", "");
    formData.set("utilitiesIncluded", "on");
    formData.set("availableFrom", "2026-06-01");
    formData.set("leaseDuration", "12 months");
    formData.set("address", "720 4th Ave S");
    formData.set("distanceToCampus", "0.4 miles");
    formData.set("contactEmail", " OWNER@Example.COM ");
    formData.set("contactPhone", " 320-555-1212 ");
    formData.set("bedrooms", "2");
    formData.set("bathrooms", "1.5");
    formData.set("petPolicy", "PETS_ALLOWED");
    formData.set("amenities", "Laundry, Parking");
    formData.append("imageUrls", "data:image/png;base64,abc123");
    formData.append("imageUrls", "data:image/jpeg;base64,def456");

    expect(createListingPayloadFromFormData(formData)).toEqual({
      title: "Near SCSU",
      type: "ROOM",
      status: "ACTIVE",
      description: "Private room near campus",
      rent: 850,
      deposit: null,
      utilitiesIncluded: true,
      availableFrom: "2026-06-01T00:00:00.000Z",
      leaseDuration: "12 months",
      address: "720 4th Ave S",
      distanceToCampus: "0.4 miles",
      contactEmail: "OWNER@Example.COM",
      contactPhone: "320-555-1212",
      bedrooms: 2,
      bathrooms: 1.5,
      petPolicy: "PETS_ALLOWED",
      amenities: ["Laundry", "Parking"],
      imageUrls: ["data:image/png;base64,abc123", "data:image/jpeg;base64,def456"],
    });
  });
});
