import Link from "next/link";

import { ListingCard } from "@/features/listings/components/listing-card";
import { ListingEmptyState } from "@/features/listings/components/listing-empty-state";
import { getActiveListings } from "@/features/listings/queries";

export const dynamic = "force-dynamic";

export default async function ListingsPage() {
  const listings = await getActiveListings();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-950">Listings</h1>
          <p className="mt-2 text-zinc-600">
            Apartments and rooms available near campus.
          </p>
        </div>
        <Link
          className="rounded-md bg-zinc-950 px-4 py-2 text-sm text-white"
          href="/listings/new"
        >
          Post listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <ListingEmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </main>
  );
}
