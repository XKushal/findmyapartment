import Link from "next/link";

import { auth, signOut } from "@/server/auth/auth";

export async function AppNav() {
  const session = await auth();

  return (
    <header className="border-b border-zinc-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-sm font-semibold text-zinc-950">
          AllApartments
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/listings" className="text-zinc-700 hover:text-zinc-950">
            Listings
          </Link>
          <Link href="/listings/new" className="text-zinc-700 hover:text-zinc-950">
            Post
          </Link>
          {session?.user ? (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-zinc-950 hover:bg-zinc-100"
              >
                Sign out
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-zinc-950 px-3 py-1.5 text-white hover:bg-zinc-800"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
