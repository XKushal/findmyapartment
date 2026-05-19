import Link from "next/link";

import { ListingFilterForm } from "@/features/listings/components/listing-filter-form";
import { ListingCard } from "@/features/listings/components/listing-card";
import { ListingEmptyState } from "@/features/listings/components/listing-empty-state";
import { getActiveListings } from "@/features/listings/queries";
import { listingQuerySchema, type ListingQueryInput } from "@/features/listings/schemas";

export const dynamic = "force-dynamic";

type ListingsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function parseListingFilters(
  searchParams: ListingsPageProps["searchParams"],
): Promise<ListingQueryInput> {
  const params = (await searchParams) ?? {};
  const parsed = listingQuerySchema.safeParse({
    type: firstParam(params.type),
    rentMin: firstParam(params.rentMin),
    rentMax: firstParam(params.rentMax),
    bedroomsMin: firstParam(params.bedroomsMin),
    bathroomsMin: firstParam(params.bathroomsMin),
    availableBy: firstParam(params.availableBy),
    petPolicy: firstParam(params.petPolicy),
  });

  return parsed.success ? parsed.data : {};
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const filters = await parseListingFilters(searchParams);
  const listings = await getActiveListings(filters);

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

      {ListingFilterForm({ filters })}

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
