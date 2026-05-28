import { describe, expect, it, vi } from "vitest";

import {
  contactRequestPayloadFromFormData,
  submitContactRequest,
} from "@/features/contact-requests/components/contact-request-form";

describe("contactRequestPayloadFromFormData", () => {
  it("normalizes contact request form data", () => {
    const formData = new FormData();
    formData.set("message", "  I would like to tour this week.  ");
    formData.set("preferredContactMethod", "PHONE");
    formData.set("contactEmail", " renter@example.com ");
    formData.set("contactPhone", "");

    expect(contactRequestPayloadFromFormData(formData)).toEqual({
      message: "I would like to tour this week.",
      preferredContactMethod: "PHONE",
      contactEmail: "renter@example.com",
      contactPhone: null,
    });
  });
});

describe("submitContactRequest", () => {
  it("treats a created contact request response as success", async () => {
    const formData = new FormData();
    formData.set("message", "I would like to tour this week.");
    formData.set("preferredContactMethod", "EMAIL");
    formData.set("contactEmail", "renter@example.com");
    formData.set("contactPhone", "");
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 201 }));

    await expect(
      submitContactRequest({
        fetcher,
        formData,
        listingId: "listing-1",
      }),
    ).resolves.toBeUndefined();

    expect(fetcher).toHaveBeenCalledWith(
      "/api/listings/listing-1/contact-requests",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("uses the API error message when contact request creation fails", async () => {
    const formData = new FormData();
    formData.set("message", "I would like to tour this week.");
    formData.set("preferredContactMethod", "EMAIL");
    const fetcher = vi.fn().mockResolvedValue(
      Response.json(
        { error: { message: "Contact email or phone is required." } },
        { status: 400 },
      ),
    );

    await expect(
      submitContactRequest({
        fetcher,
        formData,
        listingId: "listing-1",
      }),
    ).rejects.toThrow("Contact email or phone is required.");
  });
});
