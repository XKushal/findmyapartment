"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

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

export function RegisterForm({ callbackUrl }: RegisterFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.get("name"),
        email,
        password,
      }),
    });

    if (!response.ok) {
      setError(await readErrorMessage(response));
      setIsSubmitting(false);
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError("Account created, but sign-in failed. Please sign in manually.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
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
