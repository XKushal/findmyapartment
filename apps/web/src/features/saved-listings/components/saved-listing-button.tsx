"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { FormFeedback } from "@/features/ui/form-feedback";

type SavedListingButtonProps = {
  listingId: string;
  initialSaved: boolean;
};

export function SavedListingButton({
  listingId,
  initialSaved,
}: SavedListingButtonProps) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleClick() {
    setError(null);
    setIsUpdating(true);

    const nextSaved = !isSaved;
    let response: Response;

    try {
      response = await fetch(`/api/listings/${listingId}/save`, {
        method: nextSaved ? "POST" : "DELETE",
      });
    } catch {
      setIsUpdating(false);
      setError("Could not update saved listing.");
      return;
    }

    if (!response.ok) {
      setIsUpdating(false);
      setError("Could not update saved listing.");
      return;
    }

    setIsSaved(nextSaved);
    setIsUpdating(false);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isUpdating || isPending}
        aria-pressed={isSaved}
        className={
          isSaved
            ? "rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-950 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-70"
            : "rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-950 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-70"
        }
      >
        {isSaved ? "Saved" : "Save"}
      </button>
      {error ? <FormFeedback tone="error">{error}</FormFeedback> : null}
    </div>
  );
}
