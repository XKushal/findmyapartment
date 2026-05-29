"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { buttonVariants } from "@/features/ui/button";
import { fieldInput, fieldLabel } from "@/features/ui/field";
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
        <label htmlFor="name" className={fieldLabel()}>
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          minLength={2}
          autoComplete="name"
          disabled={isSubmitting}
          className={fieldInput()}
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="email" className={fieldLabel()}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          disabled={isSubmitting}
          className={fieldInput()}
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="password" className={fieldLabel()}>
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
          className={fieldInput()}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={buttonVariants({ size: "lg", className: "w-full" })}
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>

      <p className="text-sm text-stone-600">
        Already have an account?{" "}
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="font-semibold text-brand-700 underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
