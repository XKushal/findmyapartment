"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { cn } from "@/features/ui/cn";
import { HeartIcon } from "@/features/ui/icons";
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
        className={cn(
          "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60",
          isSaved
            ? "bg-brand-100 text-brand-900 hover:bg-brand-200"
            : "border border-stone-300 bg-surface text-stone-900 hover:border-stone-400 hover:bg-stone-50",
        )}
      >
        <HeartIcon
          width={16}
          height={16}
          className={isSaved ? "fill-brand-700" : undefined}
        />
        {isSaved ? "Saved" : "Save"}
      </button>
      {error ? <FormFeedback tone="error">{error}</FormFeedback> : null}
    </div>
  );
}
