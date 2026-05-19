import Link from "next/link";

import {
  LISTING_FILTER_FORM_ID,
  ListingFilterForm,
} from "@/features/listings/components/listing-filter-form";
import { ListingCard } from "@/features/listings/components/listing-card";
import { ListingEmptyState } from "@/features/listings/components/listing-empty-state";
import { getActiveListings } from "@/features/listings/queries";
import {
  listingQueryInputFromParams,
  listingQuerySchema,
  type ListingQueryInput,
} from "@/features/listings/schemas";

export const dynamic = "force-dynamic";

type ListingsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function filterComponentKey(filters: ListingQueryInput) {
  return JSON.stringify(filters);
}

async function parseListingFilters(
  searchParams: ListingsPageProps["searchParams"],
): Promise<ListingQueryInput> {
  const params = (await searchParams) ?? {};
  const parsed = listingQuerySchema.safeParse(listingQueryInputFromParams(params));

  return parsed.success ? parsed.data : {};
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const filters = await parseListingFilters(searchParams);
  const listings = await getActiveListings(filters);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-950">Listings</h1>
          <p className="mt-2 text-zinc-600">
            Apartments and rooms available near campus.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            form={LISTING_FILTER_FORM_ID}
            type="submit"
            className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Apply filters
          </button>
          <Link
            href="/listings"
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-100"
          >
            Clear
          </Link>
        </div>
      </div>

      <ListingFilterForm key={filterComponentKey(filters)} filters={filters} />

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
