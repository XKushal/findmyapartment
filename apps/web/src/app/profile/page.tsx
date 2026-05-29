import type { Listing } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ContactRequestsReceivedList,
  ContactRequestsSentList,
} from "@/features/contact-requests/components/contact-request-lists";
import {
  getReceivedContactRequestsByOwner,
  getSentContactRequestsByRequester,
} from "@/features/contact-requests/queries";
import { serializeContactRequest } from "@/features/contact-requests/schemas";
import { ListingArchiveButton } from "@/features/listings/components/listing-archive-button";
import { ListingCard } from "@/features/listings/components/listing-card";
import { getListingsByOwner } from "@/features/listings/queries";
import { ProfileAccountForm } from "@/features/profile/components/profile-account-form";
import { getProfileUser } from "@/features/profile/queries";
import { getSavedListingsByUser } from "@/features/saved-listings/queries";
import { buttonVariants } from "@/features/ui/button";
import { Container } from "@/features/ui/container";
import { auth } from "@/server/auth/auth";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function renderProfileListingRow(listing: Listing) {
  const isArchived = listing.status === "ARCHIVED";

  return (
    <article
      key={listing.id}
      className="grid gap-4 rounded-2xl border border-stone-200/80 bg-surface p-5 shadow-[var(--shadow-soft)] md:grid-cols-[1fr_auto] md:items-center"
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-stone-300 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-stone-600">
            {listing.type}
          </span>
          <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand-900">
            {listing.status}
          </span>
        </div>
        <h2 className="mt-3 text-lg font-semibold text-stone-950">
          {listing.title}
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          ${listing.rent}/month · Updated {formatDate(listing.updatedAt)}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/listings/${listing.id}`}
          className={buttonVariants({ variant: "secondary", size: "sm" })}
        >
          View
        </Link>
        <Link
          href={`/listings/${listing.id}/edit`}
          className={buttonVariants({ size: "sm" })}
        >
          Edit
        </Link>
        {!isArchived ? <ListingArchiveButton listingId={listing.id} /> : null}
      </div>
    </article>
  );
}

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=%2Fprofile");
  }

  const [
    profileUser,
    listings,
    savedListings,
    receivedContactRequests,
    sentContactRequests,
  ] = await Promise.all([
    getProfileUser(session.user.id),
    getListingsByOwner(session.user.id),
    getSavedListingsByUser(session.user.id),
    getReceivedContactRequestsByOwner(session.user.id),
    getSentContactRequestsByRequester(session.user.id),
  ]);
  const displayName = profileUser?.name ?? session.user.name ?? "Renter";
  const email = profileUser?.email ?? session.user.email;

  return (
    <main className="py-10 sm:py-12">
      <Container>
      <section className="grid gap-6 border-b border-stone-200 pb-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
            Profile
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
            {displayName}
          </h1>
          {email ? <p className="mt-2 text-stone-600">{email}</p> : null}
          {profileUser?.createdAt ? (
            <p className="mt-1 text-sm text-stone-500">
              {`Joined ${formatDate(profileUser.createdAt)}`}
            </p>
          ) : null}
        </div>
        <Link
          href="/listings/new"
          className={buttonVariants({ size: "sm" })}
        >
          Post listing
        </Link>
      </section>

      {profileUser ? (
        <section className="mt-8">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-stone-950">
              Account basics
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Keep your display name and default contact details ready for new
              listings.
            </p>
          </div>
          <ProfileAccountForm user={profileUser} />
        </section>
      ) : null}

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-stone-950">
              Your listings
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Manage active, draft, rented, and archived posts from one place.
            </p>
          </div>
          <p className="text-sm font-medium text-stone-500">
            {listings.length} total
          </p>
        </div>

        {listings.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-surface px-6 py-12 text-center">
            <h3 className="text-lg font-semibold text-stone-950">
              No listings yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
              Post your first apartment, room, or roommate lead so renters can
              find it.
            </p>
            <Link
              href="/listings/new"
              className={buttonVariants({ className: "mt-5" })}
            >
              Post your first listing
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-3">
            {listings.map(renderProfileListingRow)}
          </div>
        )}
      </section>

      <ContactRequestsReceivedList
        contactRequests={receivedContactRequests.map(serializeContactRequest)}
      />

      <ContactRequestsSentList
        contactRequests={sentContactRequests.map(serializeContactRequest)}
      />

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-stone-950">
              Saved listings
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Keep track of apartments and rooms you want to revisit.
            </p>
          </div>
          <p className="text-sm font-medium text-stone-500">
            {savedListings.length} saved
          </p>
        </div>

        {savedListings.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-surface px-6 py-12 text-center">
            <h3 className="text-lg font-semibold text-stone-950">
              No saved listings yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
              Save listings from the browse page or listing details when you
              want to compare them later.
            </p>
            <Link
              href="/listings"
              className={buttonVariants({ className: "mt-5" })}
            >
              Browse listings
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isSaved
                showSaveAction
              />
            ))}
          </div>
        )}
      </section>
      </Container>
    </main>
  );
}
