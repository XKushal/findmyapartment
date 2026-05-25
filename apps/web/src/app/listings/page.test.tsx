import { beforeEach, describe, expect, it, vi } from "vitest";

import ListingsPage from "@/app/listings/page";
import { getActiveListings } from "@/features/listings/queries";
import { getSavedListingIdsByUser } from "@/features/saved-listings/queries";
import { auth } from "@/server/auth/auth";

vi.mock("@/features/listings/queries", () => ({
  getActiveListings: vi.fn(),
}));

vi.mock("@/features/saved-listings/queries", () => ({
  getSavedListingIdsByUser: vi.fn(),
}));

vi.mock("@/server/auth/auth", () => ({
  auth: vi.fn(),
}));

function expandNode(node: unknown): unknown {
  if (!node || typeof node !== "object") {
    return node;
  }

  const element = node as {
    props?: unknown;
    type?: unknown;
  };

  if (typeof element.type === "function") {
    return element.type(element.props);
  }

  return node;
}

function includesText(node: unknown, text: string): boolean {
  node = expandNode(node);

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

function hasInputDefault(node: unknown, name: string, defaultValue: string): boolean {
  node = expandNode(node);

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

describe("ListingsPage", () => {
  beforeEach(() => {
    vi.mocked(getActiveListings).mockReset();
    vi.mocked(getSavedListingIdsByUser).mockReset();
    vi.mocked(auth).mockReset();
  });

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

  it("accepts min and max rent aliases and keeps them visible after applying filters", async () => {
    vi.mocked(getActiveListings).mockResolvedValue([]);

    const page = await ListingsPage({
      searchParams: Promise.resolve({
        min: "1100",
        max: "1600",
      }),
    });

    expect(getActiveListings).toHaveBeenCalledWith({
      rentMin: 1100,
      rentMax: 1600,
    });
    expect(hasInputDefault(page, "rentMin", "1100")).toBe(true);
    expect(hasInputDefault(page, "rentMax", "1600")).toBe(true);
  });

  it("ignores empty trailing filter params instead of dropping valid filters", async () => {
    vi.mocked(getActiveListings).mockResolvedValue([]);

    await ListingsPage({
      searchParams: Promise.resolve({
        rentMin: "1000",
        rentMax: "1600",
        type: "",
        bedroomsMin: "",
        bathroomsMin: "",
        availableBy: "",
        petPolicy: "",
      }),
    });

    expect(getActiveListings).toHaveBeenCalledWith({
      rentMin: 1000,
      rentMax: 1600,
      type: undefined,
      bedroomsMin: undefined,
      bathroomsMin: undefined,
      availableBy: undefined,
      petPolicy: undefined,
    });
  });

  it("uses a single non-empty filter when the rest are empty", async () => {
    vi.mocked(getActiveListings).mockResolvedValue([]);

    await ListingsPage({
      searchParams: Promise.resolve({
        rentMin: "",
        rentMax: "",
        type: "ROOM",
        bedroomsMin: "",
        bathroomsMin: "",
        availableBy: "",
        petPolicy: "",
      }),
    });

    expect(getActiveListings).toHaveBeenCalledWith({
      rentMin: undefined,
      rentMax: undefined,
      type: "ROOM",
      bedroomsMin: undefined,
      bathroomsMin: undefined,
      availableBy: undefined,
      petPolicy: undefined,
    });
  });

  it("shows filter actions in the header instead of a post listing action", async () => {
    vi.mocked(getActiveListings).mockResolvedValue([]);

    const page = await ListingsPage({
      searchParams: Promise.resolve({}),
    });

    expect(includesText(page, "Apply filters")).toBe(true);
    expect(includesText(page, "Clear")).toBe(true);
    expect(includesText(page, "Post listing")).toBe(false);
  });

  it("marks saved listings for signed-in users", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: "507f1f77bcf86cd799439099",
        email: "renter@example.com",
        name: "Renter",
      },
      expires: "2026-06-01T00:00:00.000Z",
    });
    vi.mocked(getActiveListings).mockResolvedValue([
      {
        id: "507f1f77bcf86cd799439011",
        title: "Saved room near campus",
        type: "ROOM",
        status: "ACTIVE",
        description: "Walkable room with utilities included.",
        rent: 650,
        deposit: null,
        utilitiesIncluded: true,
        availableFrom: null,
        leaseDuration: "12 months",
        address: null,
        distanceToCampus: "0.5 miles",
        contactEmail: null,
        contactPhone: null,
        bedrooms: 1,
        bathrooms: 1,
        petPolicy: "UNKNOWN",
        amenities: [],
        imageUrls: [],
        ownerId: null,
        createdAt: new Date("2026-05-18T12:00:00.000Z"),
        updatedAt: new Date("2026-05-19T12:00:00.000Z"),
      },
    ]);
    vi.mocked(getSavedListingIdsByUser).mockResolvedValue([
      "507f1f77bcf86cd799439011",
    ]);

    const page = await ListingsPage({
      searchParams: Promise.resolve({}),
    });

    expect(getSavedListingIdsByUser).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439099",
    );
    expect(includesText(page, "Saved room near campus")).toBe(true);
    expect(includesText(page, "Saved")).toBe(true);
  });
});
