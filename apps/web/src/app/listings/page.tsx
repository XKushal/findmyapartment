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
import { getSavedListingIdsByUser } from "@/features/saved-listings/queries";
import { buttonVariants } from "@/features/ui/button";
import { Eyebrow } from "@/features/ui/card";
import { Container } from "@/features/ui/container";
import { auth } from "@/server/auth/auth";

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
  const [listings, session] = await Promise.all([
    getActiveListings(filters),
    auth(),
  ]);
  const savedListingIds = session?.user?.id
    ? await getSavedListingIdsByUser(session.user.id)
    : [];
  const savedListingIdSet = new Set(savedListingIds);

  const resultLabel = `${listings.length} ${
    listings.length === 1 ? "place" : "places"
  } available`;

  return (
    <main className="py-10 sm:py-12">
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Browse</Eyebrow>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
              Listings near campus
            </h1>
            <p className="mt-2 text-stone-600">{resultLabel}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              form={LISTING_FILTER_FORM_ID}
              type="submit"
              className={buttonVariants()}
            >
              Apply filters
            </button>
            <Link
              href="/listings"
              className={buttonVariants({ variant: "secondary" })}
            >
              Clear
            </Link>
          </div>
        </div>

        <ListingFilterForm key={filterComponentKey(filters)} filters={filters} />

        {listings.length === 0 ? (
          <ListingEmptyState />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isSaved={savedListingIdSet.has(listing.id)}
                showSaveAction={Boolean(session?.user?.id)}
              />
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}
