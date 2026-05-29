import { redirect } from "next/navigation";

import { resolveAuthCallbackUrl } from "@/features/auth/callback-url";
import { LoginForm } from "@/features/auth/components/login-form";
import { Eyebrow } from "@/features/ui/card";
import { auth } from "@/server/auth/auth";

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const callbackUrl = resolveAuthCallbackUrl((await searchParams).callbackUrl);
  const session = await auth();

  if (session?.user?.id) {
    redirect(callbackUrl);
  }

  return (
    <main className="mx-auto my-16 w-[calc(100%-2.5rem)] max-w-md rounded-2xl border border-stone-200/80 bg-surface p-8 shadow-[var(--shadow-soft)] sm:my-24 sm:p-10">
      <Eyebrow>Welcome back</Eyebrow>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-stone-950">
        Sign in to AllApartments
      </h1>
      <p className="mt-3 leading-7 text-stone-600">
        Use your email and password to post and manage housing leads.
      </p>
      <LoginForm callbackUrl={callbackUrl} />
    </main>
  );
}
