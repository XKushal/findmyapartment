import { getListingById } from "@/features/listings/queries";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type ListingDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ListingDetailPage({
  params,
}: ListingDetailPageProps) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 text-sm font-medium uppercase text-emerald-700">
        {listing.type}
      </div>
      <h1 className="text-4xl font-semibold text-zinc-950">{listing.title}</h1>
      <p className="mt-4 text-xl font-medium text-zinc-950">
        ${listing.rent}/month
      </p>
      <p className="mt-6 leading-8 text-zinc-700">{listing.description}</p>
    </main>
  );
}
