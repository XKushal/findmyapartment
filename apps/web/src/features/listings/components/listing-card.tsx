import type { Listing } from "@prisma/client";
import Link from "next/link";

import { SavedListingButton } from "@/features/saved-listings/components/saved-listing-button";
import { Badge, listingTypeLabel } from "@/features/ui/badge";
import { BedIcon, BathIcon, PinIcon } from "@/features/ui/icons";

type ListingCardProps = {
  listing: Listing;
  isSaved?: boolean;
  showSaveAction?: boolean;
};

function formatRent(rent: number) {
  return `$${rent.toLocaleString("en-US")}`;
}

export function ListingCard({
  listing,
  isSaved = false,
  showSaveAction = false,
}: ListingCardProps) {
  const roommateCue =
    listing.type === "ROOMMATE"
      ? listing.lifestyle ?? listing.roommatePreferences ?? listing.preferredGender
      : null;
  const coverImage = listing.imageUrls[0];

  const meta = [
    listing.bedrooms !== null
      ? { icon: BedIcon, label: `${listing.bedrooms} bed` }
      : null,
    listing.bathrooms !== null
      ? { icon: BathIcon, label: `${listing.bathrooms} bath` }
      : null,
    listing.distanceToCampus
      ? { icon: PinIcon, label: listing.distanceToCampus }
      : null,
  ].filter((item): item is { icon: typeof BedIcon; label: string } =>
    Boolean(item),
  );

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-surface shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[var(--shadow-lift)]">
      <Link href={`/listings/${listing.id}`} className="block">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-brand-100">
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImage}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[linear-gradient(135deg,var(--color-brand-100),var(--color-accent-100))] text-brand-900/75">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface/80 shadow-[var(--shadow-soft)]">
                <PinIcon width={24} height={24} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.14em]">
                No photo yet
              </span>
            </div>
          )}
          <div className="absolute left-3 top-3">
            <Badge tone="brand" className="shadow-sm backdrop-blur">
              {listingTypeLabel(listing.type)}
            </Badge>
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={`/listings/${listing.id}`} className="block">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-base font-semibold leading-snug text-stone-950 group-hover:text-brand-800">
              {listing.title}
            </h2>
            <p className="shrink-0 font-display text-lg font-semibold text-brand-800">
              {formatRent(listing.rent)}
              <span className="text-xs font-normal text-stone-400">/mo</span>
            </p>
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">
            {listing.description}
          </p>
        </Link>

        {meta.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-stone-500">
            {meta.map((item) => (
              <span key={item.label} className="inline-flex items-center gap-1.5">
                <item.icon width={16} height={16} className="text-brand-500" />
                {item.label}
              </span>
            ))}
          </div>
        ) : null}

        {roommateCue ? (
          <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-800">
            {roommateCue}
          </p>
        ) : null}

        {showSaveAction ? (
          <div className="mt-auto flex justify-end pt-4">
            <SavedListingButton listingId={listing.id} initialSaved={isSaved} />
          </div>
        ) : null}
      </div>
    </article>
  );
}
