import { redirect } from "next/navigation";

import { ListingCreateForm } from "@/features/listings/components/listing-create-form";
import { getProfileUser } from "@/features/profile/queries";
import { auth } from "@/server/auth/auth";

export default async function NewListingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=%2Flistings%2Fnew");
  }

  const profileUser = await getProfileUser(session.user.id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-sm font-semibold uppercase tracking-normal text-emerald-700">
        Post listing
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-zinc-950">
        Share an apartment or room near campus.
      </h1>
      <p className="mt-4 leading-8 text-zinc-700">
        Add the essentials first. You can edit details after the post is live.
      </p>
      <ListingCreateForm
        defaultContactEmail={profileUser?.contactEmail ?? session.user.email}
        defaultContactPhone={profileUser?.contactPhone}
      />
    </main>
  );
}
