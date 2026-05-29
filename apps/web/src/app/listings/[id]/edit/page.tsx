import { ListingCreateForm } from "@/features/listings/components/listing-create-form";
import { getListingById } from "@/features/listings/queries";
import { Eyebrow } from "@/features/ui/card";
import { Container } from "@/features/ui/container";
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
    <main className="py-10 sm:py-12">
      <Container size="sm">
        <Eyebrow>Edit listing</Eyebrow>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
          Update your housing post.
        </h1>
        <p className="mt-4 leading-8 text-stone-600">
          Keep availability, price, and images current so students know what is
          still open.
        </p>
        <ListingCreateForm mode="edit" listing={listing} />
      </Container>
    </main>
  );
}
