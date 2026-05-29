import Link from "next/link";

import { buttonVariants } from "@/features/ui/button";
import { HomeMarkIcon } from "@/features/ui/icons";

export function ListingEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-surface px-6 py-16 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
        <HomeMarkIcon width={26} height={26} />
      </span>
      <h2 className="mt-5 text-lg font-semibold text-stone-950">
        No listings match yet
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">
        Try widening your filters, or be the first to post an apartment, room,
        or roommate lead near campus.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/listings" className={buttonVariants({ variant: "secondary" })}>
          Clear filters
        </Link>
        <Link href="/listings/new" className={buttonVariants()}>
          Post a listing
        </Link>
      </div>
    </div>
  );
}
