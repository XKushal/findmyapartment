import { describe, expect, it } from "vitest";

import { ProfileAccountFields } from "@/features/profile/components/profile-account-form";

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

describe("ProfileAccountFields", () => {
  it("prefills editable account basics and contact defaults", () => {
    const form = ProfileAccountFields({
      user: {
        id: "507f1f77bcf86cd799439099",
        email: "owner@example.com",
        name: "Kushal Singh",
        contactEmail: "renter@example.com",
        contactPhone: "320-555-1212",
        createdAt: new Date("2026-05-01T12:00:00.000Z"),
      },
    });

    expect(hasInputDefault(form, "name", "Kushal Singh")).toBe(true);
    expect(hasInputDefault(form, "contactEmail", "renter@example.com")).toBe(true);
    expect(hasInputDefault(form, "contactPhone", "320-555-1212")).toBe(true);
  });
});
