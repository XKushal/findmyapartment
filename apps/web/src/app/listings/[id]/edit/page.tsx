import { ListingCreateForm } from "@/features/listings/components/listing-create-form";
import { getListingById } from "@/features/listings/queries";
import { auth } from "@/server/auth/auth";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type EditListingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/listings/${id}/edit`)}`);
  }

  const listing = await getListingById(id);

  if (!listing || listing.ownerId !== session.user.id) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-sm font-semibold uppercase tracking-normal text-emerald-700">
        Edit listing
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-zinc-950">
        Update your housing post.
      </h1>
      <p className="mt-4 leading-8 text-zinc-700">
        Keep availability, price, and images current so students know what is
        still open.
      </p>
      <ListingCreateForm mode="edit" listing={listing} />
    </main>
  );
}
