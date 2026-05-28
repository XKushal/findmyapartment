import { describe, expect, it } from "vitest";

import { contactRequestPayloadFromFormData } from "@/features/contact-requests/components/contact-request-form";

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
