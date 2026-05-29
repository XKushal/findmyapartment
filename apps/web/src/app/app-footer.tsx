import Link from "next/link";

import { Container } from "@/features/ui/container";
import { HomeMarkIcon } from "@/features/ui/icons";

const LINKS = [
  { href: "/listings", label: "Browse listings" },
  { href: "/listings/new", label: "Post a place" },
  { href: "/profile", label: "Your profile" },
  { href: "/api-docs", label: "API docs" },
];

export function AppFooter() {
  return (
    <footer className="mt-20 border-t border-stone-200/70 bg-brand-50/40">
      <Container>
        <div className="flex flex-col gap-8 py-12 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-800 text-brand-50">
                <HomeMarkIcon width={18} height={18} />
              </span>
              <span className="font-display text-base font-semibold text-stone-950">
                AllApartments
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              A warm, local-first board for apartments, rooms, and roommate
              leads — built to make finding a home feel a little more human.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-stone-600 transition-colors hover:text-brand-800"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t border-stone-200/70 py-6 text-xs text-stone-500">
          © {new Date().getFullYear()} AllApartments. Find apartments, rooms,
          and roommates.
        </div>
      </Container>
    </footer>
  );
}
