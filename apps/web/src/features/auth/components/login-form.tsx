"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { buttonVariants } from "@/features/ui/button";
import { fieldInput, fieldLabel } from "@/features/ui/field";
import { FormFeedback } from "@/features/ui/form-feedback";

type LoginFormProps = {
  callbackUrl: string;
};

type SignInFn = typeof signIn;

type SubmitLoginOptions = {
  callbackUrl: string;
  email: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
  signInFn?: SignInFn;
};

type SubmitLoginResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    };

export async function submitLogin({
  callbackUrl,
  email,
  password,
  signInFn = signIn,
}: SubmitLoginOptions): Promise<SubmitLoginResult> {
  try {
    const result = await signInFn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      return {
        ok: false,
        error: "Email or password is incorrect.",
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Could not sign in. Please try again.",
    };
  }
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice("Signing in...");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const result = await submitLogin({
      callbackUrl,
      email: formData.get("email"),
      password: formData.get("password"),
    });

    setIsSubmitting(false);

    if (!result.ok) {
      setNotice(null);
      setError(result.error);
      return;
    }

    setNotice("Signed in. Opening your page...");
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
          autoComplete="current-password"
          disabled={isSubmitting}
          className={fieldInput()}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={buttonVariants({ size: "lg", className: "w-full" })}
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-sm text-stone-600">
        Need an account?{" "}
        <Link
          href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="font-semibold text-brand-700 underline-offset-4 hover:underline"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
