import type { Listing } from "@prisma/client";
import Link from "next/link";

type ListingCardProps = {
  listing: Listing;
};

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="rounded-md border border-zinc-200 p-4 transition hover:border-zinc-400"
    >
      <div className="text-xs font-medium uppercase text-emerald-700">
        {listing.type}
      </div>
      <h2 className="mt-2 text-lg font-semibold text-zinc-950">
        {listing.title}
      </h2>
      <p className="mt-2 line-clamp-2 text-sm text-zinc-600">
        {listing.description}
      </p>
      <p className="mt-4 font-medium text-zinc-950">${listing.rent}/month</p>
    </Link>
  );
}
