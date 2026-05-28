import { describe, expect, it } from "vitest";

import {
  ContactRequestsReceivedList,
  ContactRequestsSentList,
} from "@/features/contact-requests/components/contact-request-lists";
import { serializeContactRequest } from "@/features/contact-requests/schemas";

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

function includesHref(
  node: unknown,
  href: string,
  seen = new WeakSet<object>(),
): boolean {
  if (!node || typeof node !== "object") {
    return false;
  }

  if (seen.has(node)) {
    return false;
  }
  seen.add(node);

  if (
    "props" in node &&
    node.props &&
    typeof node.props === "object" &&
    "href" in node.props &&
    node.props.href === href
  ) {
    return true;
  }

  return Object.values(node).some((value) => includesHref(value, href, seen));
}

const request = serializeContactRequest({
  id: "request-1",
  listingId: "listing-1",
  requesterId: "renter-1",
  ownerId: "owner-1",
  message: "I would like to tour this week.",
  preferredContactMethod: "EMAIL",
  contactEmail: "renter@example.com",
  contactPhone: null,
  listing: {
    title: "Sunny room near SCSU",
  },
  requester: {
    name: "Renter One",
    email: "renter@example.com",
  },
  owner: {
    name: "Owner One",
    email: "owner@example.com",
  },
  createdAt: new Date("2026-05-28T12:00:00.000Z"),
  updatedAt: new Date("2026-05-28T12:00:00.000Z"),
});

describe("contact request profile lists", () => {
  it("renders received request summaries", () => {
    const list = ContactRequestsReceivedList({ contactRequests: [request] });

    expect(includesText(list, "Requests received")).toBe(true);
    expect(includesText(list, "Renter One")).toBe(true);
    expect(includesText(list, "I would like to tour this week.")).toBe(true);
    expect(includesHref(list, "/listings/listing-1")).toBe(true);
  });

  it("renders sent request summaries", () => {
    const list = ContactRequestsSentList({ contactRequests: [request] });

    expect(includesText(list, "Requests sent")).toBe(true);
    expect(includesText(list, "Owner One")).toBe(true);
    expect(includesText(list, "Sunny room near SCSU")).toBe(true);
    expect(includesHref(list, "/listings/listing-1")).toBe(true);
  });
});
