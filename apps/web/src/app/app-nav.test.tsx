import { describe, expect, it, vi } from "vitest";

import { AppNav } from "@/app/app-nav";
import { auth } from "@/server/auth/auth";

vi.mock("@/server/auth/auth", () => ({
  auth: vi.fn(),
  signOut: vi.fn(),
}));

function hasHref(node: unknown, href: string): boolean {
  if (!node || typeof node !== "object") {
    return false;
  }

  const element = node as {
    props?: { href?: unknown; children?: unknown };
  };

  if (element.props?.href === href) {
    return true;
  }

  const children = element.props?.children;

  if (Array.isArray(children)) {
    return children.some((child) => hasHref(child, href));
  }

  return hasHref(children, href);
}

function hasClassFragment(node: unknown, fragment: string): boolean {
  if (!node || typeof node !== "object") {
    return false;
  }

  const element = node as {
    props?: {
      children?: unknown;
      className?: unknown;
    };
  };

  if (
    typeof element.props?.className === "string" &&
    element.props.className.includes(fragment)
  ) {
    return true;
  }

  const children = element.props?.children;

  if (Array.isArray(children)) {
    return children.some((child) => hasClassFragment(child, fragment));
  }

  return hasClassFragment(children, fragment);
}

describe("AppNav", () => {
  it("shows a profile link for signed-in users", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: "507f1f77bcf86cd799439099",
      },
      expires: "2026-06-01T00:00:00.000Z",
    });

    const nav = await AppNav();

    expect(hasHref(nav, "/profile")).toBe(true);
  });

  it("does not show a profile link for signed-out users", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const nav = await AppNav();

    expect(hasHref(nav, "/profile")).toBe(false);
  });

  it("keeps the signed-out nav from overflowing narrow screens", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const nav = await AppNav();

    expect(hasClassFragment(nav, "min-w-0")).toBe(true);
    expect(hasClassFragment(nav, "max-[360px]:hidden")).toBe(true);
    expect(hasClassFragment(nav, "max-[360px]:px-2.5")).toBe(true);
  });
});
