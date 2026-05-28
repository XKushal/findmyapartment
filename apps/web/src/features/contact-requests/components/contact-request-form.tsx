"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { type ContactRequestCreateInput } from "@/features/contact-requests/schemas";
import { FormFeedback } from "@/features/ui/form-feedback";

type ApiErrorBody = {
  error?: {
    message?: string;
  };
};

type ContactRequestFormProps = {
  listingId: string;
  defaultContactEmail?: string | null;
  defaultContactPhone?: string | null;
};

type SubmitContactRequestOptions = {
  fetcher?: typeof fetch;
  formData: FormData;
  listingId: string;
};

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function nullableStringValue(formData: FormData, key: string) {
  const value = stringValue(formData, key);
  return value.length > 0 ? value : null;
}

async function readErrorMessage(response: Response, fallback: string) {
  const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
  return body?.error?.message ?? fallback;
}

export function contactRequestPayloadFromFormData(
  formData: FormData,
): ContactRequestCreateInput {
  return {
    message: stringValue(formData, "message"),
    preferredContactMethod: stringValue(
      formData,
      "preferredContactMethod",
    ) as ContactRequestCreateInput["preferredContactMethod"],
    contactEmail: nullableStringValue(formData, "contactEmail"),
    contactPhone: nullableStringValue(formData, "contactPhone"),
  };
}

export async function submitContactRequest({
  fetcher = fetch,
  formData,
  listingId,
}: SubmitContactRequestOptions) {
  const response = await fetcher(`/api/listings/${listingId}/contact-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(contactRequestPayloadFromFormData(formData)),
  });

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        "Could not send request. Please try again.",
      ),
    );
  }
}

export function ContactRequestForm({
  listingId,
  defaultContactEmail,
  defaultContactPhone,
}: ContactRequestFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setError(null);
    setNotice("Sending request...");
    setIsSubmitting(true);

    try {
      await submitContactRequest({ formData, listingId });
    } catch (submitError) {
      setNotice(null);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not send request. Please try again.",
      );
      setIsSubmitting(false);
      return;
    }

    form.reset();
    setNotice("Request sent.");
    router.refresh();
    setIsSubmitting(false);
  }

  return (
    <section className="mt-8 rounded-md border border-emerald-200 bg-emerald-50 px-5 py-4">
      <h2 className="text-lg font-semibold text-emerald-950">
        Contact poster
      </h2>
      <p className="mt-1 text-sm text-emerald-900">
        Send a structured request so the poster can review it from their
        profile.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
        {error ? <FormFeedback tone="error">{error}</FormFeedback> : null}
        {notice ? (
          <FormFeedback tone={isSubmitting ? "info" : "success"}>
            {notice}
          </FormFeedback>
        ) : null}

        <div className="grid gap-2">
          <label htmlFor="message" className="text-sm font-medium text-emerald-950">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={4}
            className="rounded-md border border-emerald-300 px-3 py-2 text-sm outline-none focus:border-emerald-900"
            placeholder="Share your timing, questions, or tour availability."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <label
              htmlFor="preferredContactMethod"
              className="text-sm font-medium text-emerald-950"
            >
              Preferred contact
            </label>
            <select
              id="preferredContactMethod"
              name="preferredContactMethod"
              defaultValue="ANY"
              className="rounded-md border border-emerald-300 px-3 py-2 text-sm outline-none focus:border-emerald-900"
            >
              <option value="ANY">Any</option>
              <option value="EMAIL">Email</option>
              <option value="PHONE">Phone</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="contactEmail"
              className="text-sm font-medium text-emerald-950"
            >
              Contact email
            </label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              defaultValue={defaultContactEmail ?? ""}
              className="rounded-md border border-emerald-300 px-3 py-2 text-sm outline-none focus:border-emerald-900"
            />
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="contactPhone"
              className="text-sm font-medium text-emerald-950"
            >
              Contact phone
            </label>
            <input
              id="contactPhone"
              name="contactPhone"
              type="tel"
              defaultValue={defaultContactPhone ?? ""}
              className="rounded-md border border-emerald-300 px-3 py-2 text-sm outline-none focus:border-emerald-900"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-fit rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {isSubmitting ? "Sending..." : "Send request"}
        </button>
      </form>
    </section>
  );
}
