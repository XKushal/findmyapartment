import { describe, expect, it } from "vitest";

import { ListingFilterForm } from "@/features/listings/components/listing-filter-form";

function hasInputDefault(node: unknown, name: string, defaultValue: string): boolean {
  if (!node || typeof node !== "object") {
    return false;
  }

  const element = node as {
    props?: {
      children?: unknown;
      defaultValue?: unknown;
      name?: unknown;
    };
  };

  if (element.props?.name === name && element.props.defaultValue === defaultValue) {
    return true;
  }

  const children = element.props?.children;

  if (Array.isArray(children)) {
    return children.some((child) => hasInputDefault(child, name, defaultValue));
  }

  return hasInputDefault(children, name, defaultValue);
}

describe("ListingFilterForm", () => {
  it("renders current listing discovery filters", () => {
    const form = ListingFilterForm({
      filters: {
        type: "ROOM",
        rentMin: 700,
        rentMax: 1200,
        bedroomsMin: 1,
        bathroomsMin: 1.5,
        availableBy: "2026-08-01",
        petPolicy: "PETS_ALLOWED",
      },
    });

    expect(hasInputDefault(form, "rentMin", "700")).toBe(true);
    expect(hasInputDefault(form, "rentMax", "1200")).toBe(true);
    expect(hasInputDefault(form, "bedroomsMin", "1")).toBe(true);
    expect(hasInputDefault(form, "bathroomsMin", "1.5")).toBe(true);
    expect(hasInputDefault(form, "availableBy", "2026-08-01")).toBe(true);
  });
});
