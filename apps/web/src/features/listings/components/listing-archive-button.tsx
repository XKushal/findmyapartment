"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ListingArchiveButtonProps = {
  listingId: string;
};

export function ListingArchiveButton({ listingId }: ListingArchiveButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  async function archiveListing() {
    if (!window.confirm("Archive this listing?")) {
      return;
    }

    setError(null);
    setIsArchiving(true);

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setError("Could not archive listing. Please try again.");
        return;
      }

      router.push("/listings");
      router.refresh();
    } catch {
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
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
