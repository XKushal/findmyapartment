import { redirect } from "next/navigation";

import { SwaggerDocs } from "@/app/api-docs/swagger-docs";
import { Eyebrow } from "@/features/ui/card";
import { auth } from "@/server/auth/auth";

export const dynamic = "force-dynamic";

export default async function ApiDocsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=%2Fapi-docs");
  }

  return (
    <main className="min-h-screen bg-surface">
      <div className="border-b border-stone-200/70 bg-background px-6 py-6">
        <div className="mx-auto max-w-6xl">
          <Eyebrow>RentNest API</Eyebrow>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-stone-950">
            API documentation
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Signed in as {session.user.email ?? session.user.name}. These docs
            are visible to authenticated users only.
          </p>
        </div>
      </div>
      <SwaggerDocs />
    </main>
  );
}
