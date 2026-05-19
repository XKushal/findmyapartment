"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import type { ProfileUser } from "@/features/profile/queries";

type ApiErrorBody = {
  error?: {
    message?: string;
  };
};

async function readErrorMessage(response: Response) {
  const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
  return body?.error?.message ?? "Could not update your profile. Please try again.";
}

function nullableStringValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

export function ProfileAccountForm({ user }: { user: ProfileUser }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: nullableStringValue(formData, "name"),
          contactEmail: nullableStringValue(formData, "contactEmail"),
          contactPhone: nullableStringValue(formData, "contactPhone"),
        }),
      });

      if (!response.ok) {
        setError(await readErrorMessage(response));
        return;
      }

      setNotice("Profile updated.");
      router.refresh();
    } catch {
      setError("Could not update your profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 grid gap-4 rounded-md border border-zinc-200 p-4"
    >
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {notice ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </div>
      ) : null}

      <ProfileAccountFields user={user} />

      <button
        type="submit"
        disabled={isSubmitting}
        className="justify-self-start rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
      >
        {isSubmitting ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}

export function ProfileAccountFields({ user }: { user: ProfileUser }) {
  return (
    <>
      <div className="grid gap-2">
        <label htmlFor="name" className="text-sm font-medium text-zinc-800">
          Display name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={user.name ?? ""}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
          placeholder="Kushal Singh"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label
            htmlFor="contactEmail"
            className="text-sm font-medium text-zinc-800"
          >
            Default contact email
          </label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            defaultValue={user.contactEmail ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
            placeholder={user.email}
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="contactPhone"
            className="text-sm font-medium text-zinc-800"
          >
            Default contact phone
          </label>
          <input
            id="contactPhone"
            name="contactPhone"
            type="tel"
            defaultValue={user.contactPhone ?? ""}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950"
            placeholder="320-555-1212"
          />
        </div>
      </div>

    </>
  );
}
