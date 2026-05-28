import { getListingById } from "@/features/listings/queries";
import { ListingArchiveButton } from "@/features/listings/components/listing-archive-button";
import { ListingImageGallery } from "@/features/listings/components/listing-image-gallery";
import { ContactRequestForm } from "@/features/contact-requests/components/contact-request-form";
import { getProfileUser } from "@/features/profile/queries";
import { ReviewSection } from "@/features/reviews/components/review-section";
import { getReviewsForListing } from "@/features/reviews/mutations";
import { serializeReview } from "@/features/reviews/schemas";
import { SavedListingButton } from "@/features/saved-listings/components/saved-listing-button";
import { getSavedListingIdsByUser } from "@/features/saved-listings/queries";
import { auth } from "@/server/auth/auth";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type ListingDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ListingDetailPage({
  params,
}: ListingDetailPageProps) {
  const { id } = await params;
  const [listing, reviews, session] = await Promise.all([
    getListingById(id),
    getReviewsForListing(id),
    auth(),
  ]);

  if (!listing) {
    notFound();
  }

  const isOwner = Boolean(session?.user?.id && session.user.id === listing.ownerId);
  const savedListingIds = session?.user?.id
    ? await getSavedListingIdsByUser(session.user.id)
    : [];
  const profileUser = session?.user?.id && !isOwner
    ? await getProfileUser(session.user.id)
    : null;
  const isSaved = savedListingIds.includes(listing.id);
  const hasContactInfo = Boolean(listing.contactEmail || listing.contactPhone);
  const roommateDetails =
    listing.type === "ROOMMATE"
      ? [
          [
            "Roommates needed",
            listing.roommateCount === null ? null : String(listing.roommateCount),
          ],
          ["Preferred gender", listing.preferredGender],
          ["Lifestyle", listing.lifestyle],
          ["Cleanliness", listing.cleanliness],
          ["Smoking policy", listing.smokingPolicy],
          ["Preferences", listing.roommatePreferences],
        ].filter((detail): detail is [string, string] => Boolean(detail[1]))
      : [];
  const details = [
    ["Deposit", listing.deposit === null ? "Not listed" : `$${listing.deposit}`],
    ["Utilities", listing.utilitiesIncluded ? "Included" : "Not included"],
    [
      "Available",
      listing.availableFrom
        ? listing.availableFrom.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Ask poster",
    ],
    ["Lease", listing.leaseDuration ?? "Flexible"],
    ["Distance", listing.distanceToCampus ?? "Not listed"],
    [
      "Beds / baths",
      `${listing.bedrooms ?? "?"} bed / ${listing.bathrooms ?? "?"} bath`,
    ],
  ];

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm font-medium uppercase text-emerald-700">
          {listing.type}
        </div>
        {isOwner ? (
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/listings/${listing.id}/edit`}
              className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Edit
            </Link>
            <ListingArchiveButton listingId={listing.id} />
          </div>
        ) : session?.user?.id ? (
          <SavedListingButton listingId={listing.id} initialSaved={isSaved} />
        ) : (
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(`/listings/${listing.id}`)}`}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-100"
          >
            Sign in to save
          </Link>
        )}
      </div>
      <h1 className="text-4xl font-semibold text-zinc-950">{listing.title}</h1>
      <p className="mt-4 text-xl font-medium text-zinc-950">
        ${listing.rent}/month
      </p>
      <p className="mt-6 leading-8 text-zinc-700">{listing.description}</p>

      <ListingImageGallery imageUrls={listing.imageUrls} />

      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        {details.map(([label, value]) => (
          <div key={label} className="border-t border-zinc-200 pt-4">
            <dt className="text-sm text-zinc-500">{label}</dt>
            <dd className="mt-1 font-medium text-zinc-950">{value}</dd>
          </div>
        ))}
      </dl>

      {listing.address ? (
        <div className="mt-8 border-t border-zinc-200 pt-4">
          <p className="text-sm text-zinc-500">Address</p>
          <p className="mt-1 font-medium text-zinc-950">{listing.address}</p>
        </div>
      ) : null}

      {roommateDetails.length > 0 ? (
        <section className="mt-8 border-t border-zinc-200 pt-6">
          <h2 className="text-lg font-semibold text-zinc-950">Roommate fit</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            {roommateDetails.map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm text-zinc-500">{label}</dt>
                <dd className="mt-1 font-medium text-zinc-950">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {!isOwner && hasContactInfo ? (
        <section className="mt-8 rounded-md border border-emerald-200 bg-emerald-50 px-5 py-4">
          <p className="text-sm font-semibold text-emerald-900">
            Contact poster
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {listing.contactEmail ? (
              <a
                href={`mailto:${listing.contactEmail}?subject=${encodeURIComponent(
                  `Interested in ${listing.title}`,
                )}`}
                className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Email poster
              </a>
            ) : null}
            {listing.contactPhone ? (
              <a
                href={`tel:${listing.contactPhone}`}
                className="rounded-md border border-emerald-300 px-4 py-2 text-sm font-medium text-emerald-950 hover:bg-emerald-100"
              >
                Call or text
              </a>
            ) : null}
          </div>
        </section>
      ) : null}

      {!isOwner && session?.user?.id ? (
        <ContactRequestForm
          listingId={listing.id}
          defaultContactEmail={
            profileUser?.contactEmail ?? session.user.email ?? null
          }
          defaultContactPhone={profileUser?.contactPhone ?? null}
        />
      ) : null}

      {listing.amenities.length > 0 ? (
        <div className="mt-8">
          <p className="text-sm font-medium text-zinc-950">Amenities</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {listing.amenities.map((amenity) => (
              <span
                key={amenity}
                className="rounded-md border border-zinc-200 px-3 py-1 text-sm text-zinc-700"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <ReviewSection
        listingId={listing.id}
        initialReviews={reviews.map(serializeReview)}
        currentUserId={session?.user?.id ?? null}
      />
    </main>
  );
}
