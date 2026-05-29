"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/features/ui/cn";

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
};

/**
 * Top-nav link with an active treatment derived from the current path.
 * Keeps `href` as a direct prop so server-side nav tests can discover it.
 */
export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive =
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "text-brand-900"
          : "text-stone-600 hover:text-stone-950",
      )}
    >
      {children}
      <span
        className={cn(
          "absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand-600 transition-opacity",
          isActive ? "opacity-100" : "opacity-0",
        )}
      />
    </Link>
  );
}
