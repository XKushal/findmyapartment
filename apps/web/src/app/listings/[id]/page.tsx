import { getListingById } from "@/features/listings/queries";
import { ListingImageGallery } from "@/features/listings/components/listing-image-gallery";
import { ListingStatusActions } from "@/features/listings/components/listing-status-actions";
import { ContactRequestForm } from "@/features/contact-requests/components/contact-request-form";
import { getProfileUser } from "@/features/profile/queries";
import { ReviewSection } from "@/features/reviews/components/review-section";
import { getReviewsForListing } from "@/features/reviews/mutations";
import { serializeReview } from "@/features/reviews/schemas";
import { SavedListingButton } from "@/features/saved-listings/components/saved-listing-button";
import { getSavedListingIdsByUser } from "@/features/saved-listings/queries";
import { Badge, listingTypeLabel, listingStatusTone } from "@/features/ui/badge";
import { buttonVariants } from "@/features/ui/button";
import { Card } from "@/features/ui/card";
import { Container } from "@/features/ui/container";
import {
  ArrowRightIcon,
  CheckIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
} from "@/features/ui/icons";
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
    <main className="py-8 sm:py-10">
      <Container>
        <Link
          href="/listings"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-brand-800"
        >
          <ArrowRightIcon width={16} height={16} className="rotate-180" />
          Back to listings
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Badge tone="brand">{listingTypeLabel(listing.type)}</Badge>
          {listing.status !== "ACTIVE" ? (
            <Badge tone={listingStatusTone(listing.status)}>
              {listing.status}
            </Badge>
          ) : null}
        </div>

        <h1 className="mt-3 max-w-3xl font-display text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
          {listing.title}
        </h1>
        {listing.address ? (
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-stone-500">
            <PinIcon width={16} height={16} className="text-brand-500" />
            {listing.address}
          </p>
        ) : null}

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          {/* Main column */}
          <div className="min-w-0">
            <ListingImageGallery imageUrls={listing.imageUrls} />

            <section className="mt-8">
              <h2 className="text-lg font-semibold text-stone-950">
                About this place
              </h2>
              <p className="mt-3 whitespace-pre-line leading-8 text-stone-700">
                {listing.description}
              </p>
            </section>

            <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-stone-200/80 bg-stone-200/60 sm:grid-cols-2">
              {details.map(([label, value]) => (
                <div key={label} className="bg-surface px-5 py-4">
                  <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    {label}
                  </dt>
                  <dd className="mt-1 font-medium text-stone-950">{value}</dd>
                </div>
              ))}
            </dl>

            {roommateDetails.length > 0 ? (
              <section className="mt-8">
                <h2 className="text-lg font-semibold text-stone-950">
                  Roommate fit
                </h2>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  {roommateDetails.map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-stone-200/80 bg-surface px-4 py-3"
                    >
                      <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">
                        {label}
                      </dt>
                      <dd className="mt-1 font-medium text-stone-950">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}

            {listing.amenities.length > 0 ? (
              <section className="mt-8">
                <h2 className="text-lg font-semibold text-stone-950">Amenities</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {listing.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-surface px-3 py-1.5 text-sm text-stone-700"
                    >
                      <CheckIcon width={15} height={15} className="text-brand-600" />
                      {amenity}
                    </span>
                  ))}
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

            <ReviewSection
              listingId={listing.id}
              initialReviews={reviews.map(serializeReview)}
              currentUserId={session?.user?.id ?? null}
              isOwner={isOwner}
            />
          </div>

          {/* Sticky sidebar */}
          <aside className="lg:sticky lg:top-24">
            <Card className="p-6">
              <p className="font-display text-3xl font-semibold text-stone-950">
                ${listing.rent.toLocaleString("en-US")}
                <span className="text-base font-normal text-stone-400">
                  {" "}
                  / month
                </span>
              </p>

              <div className="mt-5 grid gap-3">
                {isOwner ? (
                  <>
                    <Link
                      href={`/listings/${listing.id}/edit`}
                      className={buttonVariants({ className: "w-full" })}
                    >
                      Edit listing
                    </Link>
                    <ListingStatusActions
                      listingId={listing.id}
                      redirectAfterChange="/profile"
                      status={listing.status}
                    />
                  </>
                ) : session?.user?.id ? (
                  <SavedListingButton
                    listingId={listing.id}
                    initialSaved={isSaved}
                  />
                ) : (
                  <Link
                    href={`/login?callbackUrl=${encodeURIComponent(`/listings/${listing.id}`)}`}
                    className={buttonVariants({
                      variant: "secondary",
                      className: "w-full",
                    })}
                  >
                    Sign in to save
                  </Link>
                )}
              </div>

              {!isOwner && hasContactInfo ? (
                <div className="mt-5 border-t border-stone-200 pt-5">
                  <p className="text-sm font-semibold text-stone-900">
                    Reach the poster
                  </p>
                  <div className="mt-3 grid gap-2">
                    {listing.contactEmail ? (
                      <a
                        href={`mailto:${listing.contactEmail}?subject=${encodeURIComponent(
                          `Interested in ${listing.title}`,
                        )}`}
                        className={buttonVariants({
                          variant: "subtle",
                          size: "sm",
                          className: "w-full",
                        })}
                      >
                        <MailIcon width={16} height={16} />
                        Email poster
                      </a>
                    ) : null}
                    {listing.contactPhone ? (
                      <a
                        href={`tel:${listing.contactPhone}`}
                        className={buttonVariants({
                          variant: "secondary",
                          size: "sm",
                          className: "w-full",
                        })}
                      >
                        <PhoneIcon width={16} height={16} />
                        Call or text
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </Card>
          </aside>
        </div>
      </Container>
    </main>
  );
}
