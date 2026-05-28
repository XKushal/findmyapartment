import type { Listing } from "@prisma/client";
import Link from "next/link";

import { SavedListingButton } from "@/features/saved-listings/components/saved-listing-button";

type ListingCardProps = {
  listing: Listing;
  isSaved?: boolean;
  showSaveAction?: boolean;
};

export function ListingCard({
  listing,
  isSaved = false,
  showSaveAction = false,
}: ListingCardProps) {
  const roommateCue =
    listing.type === "ROOMMATE"
      ? listing.lifestyle ?? listing.roommatePreferences ?? listing.preferredGender
      : null;

  return (
    <article className="grid gap-4 rounded-md border border-zinc-200 p-4 transition hover:border-zinc-400">
      <Link href={`/listings/${listing.id}`} className="block">
        <div className="text-xs font-medium uppercase text-emerald-700">
          {listing.type}
        </div>
        <h2 className="mt-2 text-lg font-semibold text-zinc-950">
          {listing.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm text-zinc-600">
          {listing.description}
        </p>
        {roommateCue ? (
          <p className="mt-3 text-sm font-medium text-emerald-800">
            {roommateCue}
          </p>
        ) : null}
        <p className="mt-4 font-medium text-zinc-950">${listing.rent}/month</p>
      </Link>
      {showSaveAction ? (
        <div className="flex justify-end">
          <SavedListingButton listingId={listing.id} initialSaved={isSaved} />
        </div>
      ) : null}
    </article>
  );
}
