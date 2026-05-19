import { resolveAuthCallbackUrl } from "@/features/auth/callback-url";
import { RegisterForm } from "@/features/auth/components/register-form";

type RegisterPageProps = {
  searchParams: Promise<{
    callbackUrl?: string | string[];
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const callbackUrl = resolveAuthCallbackUrl((await searchParams).callbackUrl);

  return (
    <main className="mx-auto w-full max-w-md px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-normal text-emerald-700">
        Create account
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-zinc-950">
        Join AllApartments
      </h1>
      <p className="mt-3 leading-7 text-zinc-600">
        Create a local account to post listings and keep ownership tied to you.
      </p>
      <RegisterForm callbackUrl={callbackUrl} />
    </main>
  );
}
