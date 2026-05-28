import { redirect } from "next/navigation";

import { resolveAuthCallbackUrl } from "@/features/auth/callback-url";
import { LoginForm } from "@/features/auth/components/login-form";
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
    <main className="mx-auto w-full max-w-md px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-normal text-emerald-700">
        Welcome back
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-zinc-950">
        Sign in to AllApartments
      </h1>
      <p className="mt-3 leading-7 text-zinc-600">
        Use your email and password to post and manage housing leads.
      </p>
      <LoginForm callbackUrl={callbackUrl} />
    </main>
  );
}
