"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { FormFeedback } from "@/features/ui/form-feedback";

type ListingArchiveButtonProps = {
  listingId: string;
};

export function ListingArchiveButton({ listingId }: ListingArchiveButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  async function archiveListing() {
    if (!window.confirm("Archive this listing?")) {
      return;
    }

    setError(null);
    setNotice("Archiving listing...");
    setIsArchiving(true);

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setNotice(null);
        setError("Could not archive listing. Please try again.");
        return;
      }

      setNotice("Listing archived.");
      router.push("/listings");
      router.refresh();
    } catch {
      setNotice(null);
      setError("Could not archive listing. Please try again.");
    } finally {
      setIsArchiving(false);
    }
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={archiveListing}
        disabled={isArchiving}
        className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-red-300"
      >
        {isArchiving ? "Archiving..." : "Archive"}
      </button>
      {error ? <FormFeedback tone="error">{error}</FormFeedback> : null}
      {notice ? (
        <FormFeedback tone={isArchiving ? "info" : "success"}>
          {notice}
        </FormFeedback>
      ) : null}
    </div>
  );
}
