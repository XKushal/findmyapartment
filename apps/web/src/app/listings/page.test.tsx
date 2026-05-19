import { describe, expect, it, vi } from "vitest";

import ListingsPage from "@/app/listings/page";
import { getActiveListings } from "@/features/listings/queries";

vi.mock("@/features/listings/queries", () => ({
  getActiveListings: vi.fn(),
}));

function includesText(node: unknown, text: string): boolean {
  if (typeof node === "string" || typeof node === "number") {
    return String(node).includes(text);
  }

  if (!node || typeof node !== "object") {
    return false;
  }

  const element = node as { props?: { children?: unknown } };
  const children = element.props?.children;

  if (Array.isArray(children)) {
    return children.some((child) => includesText(child, text));
  }

  return includesText(children, text);
}

describe("ListingsPage", () => {
  it("uses URL filters for active listing discovery", async () => {
    vi.mocked(getActiveListings).mockResolvedValue([]);

    const page = await ListingsPage({
      searchParams: Promise.resolve({
        type: "ROOM",
        rentMin: "700",
        rentMax: "1200",
        bedroomsMin: "1",
        bathroomsMin: "1.5",
        availableBy: "2026-08-01",
        petPolicy: "PETS_ALLOWED",
      }),
    });

    expect(getActiveListings).toHaveBeenCalledWith({
      type: "ROOM",
      rentMin: 700,
      rentMax: 1200,
      bedroomsMin: 1,
      bathroomsMin: 1.5,
      availableBy: "2026-08-01",
      petPolicy: "PETS_ALLOWED",
    });
    expect(includesText(page, "Min price")).toBe(true);
    expect(includesText(page, "Pet policy")).toBe(true);
  });
});
