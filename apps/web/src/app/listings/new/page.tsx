import Link from "next/link";

export default function NewListingPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-sm font-semibold uppercase tracking-normal text-emerald-700">
        Post listing
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-zinc-950">
        Apartment and room posting is the next build slice.
      </h1>
      <p className="mt-4 leading-8 text-zinc-700">
        The foundation is ready for Prisma-backed listings. The posting form,
        validation, and owner-only write flow will be added after the initial
        app shell PR.
      </p>
      <Link
        href="/listings"
        className="mt-8 inline-flex rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-100"
      >
        Back to listings
      </Link>
    </main>
  );
}
