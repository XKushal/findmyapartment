import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-12">
      <section className="grid flex-1 content-center gap-8">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-normal text-emerald-700">
            AllApartments
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-zinc-950 sm:text-6xl">
            Find apartments, rooms, and roommate leads near campus.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-zinc-700">
            A local-first rental board for browsing trusted housing posts,
            comparing rent, and contacting posters safely.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/listings"
            className="rounded-md bg-zinc-950 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Browse listings
          </Link>
          <Link
            href="/listings/new"
            className="rounded-md border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-950 hover:bg-zinc-100"
          >
            Post a place
          </Link>
        </div>
      </section>
    </main>
  );
}
