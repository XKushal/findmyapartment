import { redirect } from "next/navigation";

import { ListingCreateForm } from "@/features/listings/components/listing-create-form";
import { getProfileUser } from "@/features/profile/queries";
import { Eyebrow } from "@/features/ui/card";
import { auth } from "@/server/auth/auth";

export default async function NewListingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=%2Flistings%2Fnew");
  }

  const profileUser = await getProfileUser(session.user.id);

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-12">
      <Eyebrow>Post listing</Eyebrow>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
        Share an apartment or room near campus.
      </h1>
      <p className="mt-4 leading-8 text-stone-600">
        Add the essentials first. You can edit details after the post is live.
      </p>
      <ListingCreateForm
        defaultContactEmail={profileUser?.contactEmail ?? session.user.email}
        defaultContactPhone={profileUser?.contactPhone}
      />
    </main>
  );
}
