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
      className="grid gap-4 rounded-md border border-zinc-200 p-4 md:grid-cols-[1fr_auto] md:items-center"
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700">
            {listing.type}
          </span>
          <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
            {listing.status}
          </span>
        </div>
        <h2 className="mt-3 text-lg font-semibold text-zinc-950">
          {listing.title}
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          ${listing.rent}/month · Updated {formatDate(listing.updatedAt)}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/listings/${listing.id}`}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-100"
        >
          View
        </Link>
        <Link
          href={`/listings/${listing.id}/edit`}
          className="rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
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
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <section className="grid gap-6 border-b border-zinc-200 pb-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="text-sm font-medium uppercase text-emerald-700">
            Profile
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
            {displayName}
          </h1>
          {email ? <p className="mt-2 text-zinc-600">{email}</p> : null}
          {profileUser?.createdAt ? (
            <p className="mt-1 text-sm text-zinc-500">
              {`Joined ${formatDate(profileUser.createdAt)}`}
            </p>
          ) : null}
        </div>
        <Link
          href="/listings/new"
          className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Post listing
        </Link>
      </section>

      {profileUser ? (
        <section className="mt-8">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-950">
              Account basics
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
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
            <h2 className="text-2xl font-semibold text-zinc-950">
              Your listings
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Manage active, draft, rented, and archived posts from one place.
            </p>
          </div>
          <p className="text-sm font-medium text-zinc-500">
            {listings.length} total
          </p>
        </div>

        {listings.length === 0 ? (
          <div className="mt-6 rounded-md border border-dashed border-zinc-300 px-6 py-10 text-center">
            <h3 className="text-lg font-semibold text-zinc-950">
              No listings yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">
              Post your first apartment, room, or roommate lead so renters can
              find it near campus.
            </p>
            <Link
              href="/listings/new"
              className="mt-5 inline-flex rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
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
            <h2 className="text-2xl font-semibold text-zinc-950">
              Saved listings
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Keep track of apartments and rooms you want to revisit.
            </p>
          </div>
          <p className="text-sm font-medium text-zinc-500">
            {savedListings.length} saved
          </p>
        </div>

        {savedListings.length === 0 ? (
          <div className="mt-6 rounded-md border border-dashed border-zinc-300 px-6 py-10 text-center">
            <h3 className="text-lg font-semibold text-zinc-950">
              No saved listings yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">
              Save listings from the browse page or listing details when you
              want to compare them later.
            </p>
            <Link
              href="/listings"
              className="mt-5 inline-flex rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
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
    </main>
  );
}
