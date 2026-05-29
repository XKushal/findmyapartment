"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import type { ProfileUser } from "@/features/profile/queries";
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
    setNotice("Saving profile...");
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
        setNotice(null);
        setError(await readErrorMessage(response));
        return;
      }

      setNotice("Profile updated.");
      router.refresh();
    } catch {
      setNotice(null);
      setError("Could not update your profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 grid gap-4 rounded-2xl border border-stone-200/80 bg-surface p-6 shadow-[var(--shadow-soft)]"
    >
      {error ? (
        <FormFeedback tone="error">{error}</FormFeedback>
      ) : null}
      {notice ? (
        <FormFeedback tone={isSubmitting ? "info" : "success"}>
          {notice}
        </FormFeedback>
      ) : null}

      <ProfileAccountFields user={user} />

      <button
        type="submit"
        disabled={isSubmitting}
        className={buttonVariants({ className: "justify-self-start" })}
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
        <label htmlFor="name" className={fieldLabel()}>
          Display name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={user.name ?? ""}
          className={fieldInput()}
          placeholder="Kushal Singh"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label
            htmlFor="contactEmail"
            className={fieldLabel()}
          >
            Default contact email
          </label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            defaultValue={user.contactEmail ?? ""}
            className={fieldInput()}
            placeholder={user.email}
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="contactPhone"
            className={fieldLabel()}
          >
            Default contact phone
          </label>
          <input
            id="contactPhone"
            name="contactPhone"
            type="tel"
            defaultValue={user.contactPhone ?? ""}
            className={fieldInput()}
            placeholder="320-555-1212"
          />
        </div>
      </div>

    </>
  );
}
