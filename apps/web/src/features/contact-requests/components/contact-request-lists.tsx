import Link from "next/link";

import { type ContactRequestApiResponse } from "@/features/contact-requests/schemas";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function methodLabel(value: ContactRequestApiResponse["preferredContactMethod"]) {
  if (value === "EMAIL") {
    return "Email";
  }

  if (value === "PHONE") {
    return "Phone";
  }

  return "Any";
}

type ContactRequestListProps = {
  contactRequests: ContactRequestApiResponse[];
};

export function ContactRequestsReceivedList({
  contactRequests,
}: ContactRequestListProps) {
  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-stone-950">
            Requests received
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            Review renter interest across your listings.
          </p>
        </div>
        <p className="text-sm font-medium text-stone-500">
          {contactRequests.length} total
        </p>
      </div>

      {contactRequests.length === 0 ? (
        <div className="mt-6 rounded-md border border-dashed border-stone-300 px-6 py-8 text-center">
          <h3 className="text-lg font-semibold text-stone-950">
            No requests received yet
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
            Requests from renters will show up here after they contact you from
            a listing.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          {contactRequests.map((request) => (
            <article
              key={request.id}
              className="rounded-2xl border border-stone-200/80 bg-surface p-5 shadow-[var(--shadow-soft)]"
            >
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <h3 className="font-semibold">
                    <Link
                      href={`/listings/${request.listingId}`}
                      className="text-stone-950 underline-offset-4 hover:underline"
                    >
                      {request.listingTitle}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-stone-600">
                    From {request.requesterName ?? request.requesterEmail ?? "Renter"}
                  </p>
                </div>
                <p className="text-sm text-stone-500">
                  {formatDate(request.createdAt)}
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-stone-700">
                {request.message}
              </p>
              <p className="mt-3 text-sm font-medium text-stone-950">
                Preferred contact: {methodLabel(request.preferredContactMethod)}
              </p>
              <p className="mt-1 text-sm text-stone-600">
                {[request.contactEmail, request.contactPhone].filter(Boolean).join(" · ")}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function ContactRequestsSentList({
  contactRequests,
}: ContactRequestListProps) {
  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-stone-950">
            Requests sent
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            Track the listings you contacted from the app.
          </p>
        </div>
        <p className="text-sm font-medium text-stone-500">
          {contactRequests.length} total
        </p>
      </div>

      {contactRequests.length === 0 ? (
        <div className="mt-6 rounded-md border border-dashed border-stone-300 px-6 py-8 text-center">
          <h3 className="text-lg font-semibold text-stone-950">
            No requests sent yet
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
            Contact a poster from a listing detail page and your request will
            appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          {contactRequests.map((request) => (
            <article
              key={request.id}
              className="rounded-2xl border border-stone-200/80 bg-surface p-5 shadow-[var(--shadow-soft)]"
            >
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <h3 className="font-semibold">
                    <Link
                      href={`/listings/${request.listingId}`}
                      className="text-stone-950 underline-offset-4 hover:underline"
                    >
                      {request.listingTitle}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-stone-600">
                    To {request.ownerName ?? request.ownerEmail ?? "Owner"}
                  </p>
                </div>
                <p className="text-sm text-stone-500">
                  {formatDate(request.createdAt)}
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-stone-700">
                {request.message}
              </p>
              <p className="mt-3 text-sm font-medium text-stone-950">
                Preferred contact: {methodLabel(request.preferredContactMethod)}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
