import Link from "next/link";

import { NavLink } from "@/app/nav-link";
import { buttonVariants } from "@/features/ui/button";
import { Container } from "@/features/ui/container";
import { HomeMarkIcon } from "@/features/ui/icons";
import { auth, signOut } from "@/server/auth/auth";

export async function AppNav() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-background/85 backdrop-blur-md">
      <Container className="px-3 sm:px-8">
        <div className="flex h-16 min-w-0 items-center justify-between gap-2 sm:gap-4">
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-2.5"
            aria-label="RentNest home"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-800 text-brand-50 shadow-[var(--shadow-soft)] transition-transform group-hover:-rotate-3">
              <HomeMarkIcon width={20} height={20} />
            </span>
            <span className="truncate font-display text-lg font-semibold text-stone-950 max-[360px]:hidden">
              RentNest
            </span>
          </Link>

          <nav className="flex shrink-0 items-center gap-0.5 sm:gap-2">
            <NavLink href="/listings">Listings</NavLink>
            <NavLink href="/listings/new">Post</NavLink>
            {session?.user ? (
              <>
                <NavLink href="/profile">Profile</NavLink>
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <button
                    type="submit"
                    className={buttonVariants({
                      variant: "secondary",
                      size: "sm",
                      className: "ml-1",
                    })}
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className={buttonVariants({
                  size: "sm",
                  className: "ml-0.5 max-[360px]:px-2.5 sm:ml-1",
                })}
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </Container>
    </header>
  );
}
