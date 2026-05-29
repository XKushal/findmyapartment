"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { FormFeedback } from "@/features/ui/form-feedback";

type ApiErrorBody = {
  error?: {
    message?: string;
  };
};

async function readErrorMessage(response: Response) {
  const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
  return body?.error?.message ?? "Could not create your account. Please try again.";
}

type RegisterFormProps = {
  callbackUrl: string;
};

type SignInFn = typeof signIn;

type SubmitRegistrationOptions = {
  callbackUrl: string;
  email: FormDataEntryValue | null;
  fetcher?: typeof fetch;
  name: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
  signInFn?: SignInFn;
};

type SubmitRegistrationResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    };

export async function submitRegistration({
  callbackUrl,
  email,
  fetcher = fetch,
  name,
  password,
  signInFn = signIn,
}: SubmitRegistrationOptions): Promise<SubmitRegistrationResult> {
  try {
    const response = await fetcher("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    if (!response.ok) {
      return {
        ok: false,
        error: await readErrorMessage(response),
      };
    }

    const result = await signInFn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      return {
        ok: false,
        error: "Account created, but sign-in failed. Please sign in manually.",
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Could not create your account. Please try again.",
    };
  }
}

export function RegisterForm({ callbackUrl }: RegisterFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice("Creating account...");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const result = await submitRegistration({
      callbackUrl,
      email: formData.get("email"),
      name: formData.get("name"),
      password: formData.get("password"),
    });

    setIsSubmitting(false);

    if (!result.ok) {
      setNotice(null);
      setError(result.error);
      return;
    }

    setNotice("Account created. Opening your page...");
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
      {error ? (
        <FormFeedback tone="error">{error}</FormFeedback>
      ) : null}
      {notice ? (
        <FormFeedback tone={isSubmitting ? "info" : "success"}>
          {notice}
        </FormFeedback>
      ) : null}

      <div className="grid gap-2">
        <label htmlFor="name" className="text-sm font-medium text-zinc-800">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          minLength={2}
          autoComplete="name"
          disabled={isSubmitting}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="email" className="text-sm font-medium text-zinc-800">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          disabled={isSubmitting}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="password" className="text-sm font-medium text-zinc-800">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          disabled={isSubmitting}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-zinc-950 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>

      <p className="text-sm text-zinc-600">
        Already have an account?{" "}
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="font-medium text-zinc-950 underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
