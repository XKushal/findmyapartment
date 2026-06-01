"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { buttonVariants } from "@/features/ui/button";
import { cn } from "@/features/ui/cn";
import { FormFeedback } from "@/features/ui/form-feedback";

type ListingStatus = "DRAFT" | "ACTIVE" | "RENTED" | "ARCHIVED";

type ListingStatusAction = {
  label: string;
  nextStatus: ListingStatus;
  variant?: "primary" | "secondary" | "danger";
};

type ListingStatusActionsProps = {
  listingId: string;
  redirectAfterChange?: string;
  status: ListingStatus;
};

type ListingStatusConfirmationCopy = {
  title: string;
  body: string;
  confirmLabel: string;
};

export const LISTING_STATUS_NOTICE_TIMEOUT_MS = 2500;

const ACTIONS_BY_STATUS: Record<ListingStatus, ListingStatusAction[]> = {
  ACTIVE: [
    { label: "Mark rented", nextStatus: "RENTED", variant: "secondary" },
    { label: "Archive", nextStatus: "ARCHIVED", variant: "danger" },
  ],
  DRAFT: [
    { label: "Publish", nextStatus: "ACTIVE" },
    { label: "Archive", nextStatus: "ARCHIVED", variant: "danger" },
  ],
  RENTED: [
    { label: "Reactivate", nextStatus: "ACTIVE" },
    { label: "Archive", nextStatus: "ARCHIVED", variant: "danger" },
  ],
  ARCHIVED: [{ label: "Reactivate", nextStatus: "ACTIVE" }],
};

export function listingStatusActionLabels(status: ListingStatus) {
  return ACTIONS_BY_STATUS[status].map((action) => action.label);
}

export function listingStatusConfirmationCopy(
  nextStatus: ListingStatus,
): ListingStatusConfirmationCopy {
  if (nextStatus === "ARCHIVED") {
    return {
      title: "Archive listing?",
      body: "This removes the listing from public browsing and keeps it available in your archived listings.",
      confirmLabel: "Archive",
    };
  }

  if (nextStatus === "RENTED") {
    return {
      title: "Mark as rented?",
      body: "This removes the listing from public browsing but keeps it in your profile.",
      confirmLabel: "Mark rented",
    };
  }

  if (nextStatus === "ACTIVE") {
    return {
      title: "Reactivate listing?",
      body: "This makes the listing active again so renters can find it.",
      confirmLabel: "Reactivate",
    };
  }

  return {
    title: "Publish listing?",
    body: "This makes the listing visible to renters.",
    confirmLabel: "Publish",
  };
}

const feedbackToneClassNames = {
  info: "border-brand-200 bg-brand-50 text-brand-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

export function listingStatusFeedbackClassName(
  tone: keyof typeof feedbackToneClassNames,
) {
  return cn(
    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
    feedbackToneClassNames[tone],
  );
}

export function ListingStatusActions({
  listingId,
  redirectAfterChange,
  status,
}: ListingStatusActionsProps) {
  const router = useRouter();
  const [pendingStatus, setPendingStatus] = useState<ListingStatus | null>(null);
  const [confirmAction, setConfirmAction] =
    useState<ListingStatusAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const actions = ACTIONS_BY_STATUS[status];
  const confirmationCopy = confirmAction
    ? listingStatusConfirmationCopy(confirmAction.nextStatus)
    : null;

  async function changeStatus(action: ListingStatusAction) {
    setError(null);
    setConfirmAction(null);
    setNotice("Updating listing status...");
    setPendingStatus(action.nextStatus);

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ status: action.nextStatus }),
      });

      if (!response.ok) {
        setNotice(null);
        setError("Could not update listing status. Please try again.");
        return;
      }

      setNotice("Listing status updated.");

      if (redirectAfterChange) {
        router.push(redirectAfterChange);
      }

      router.refresh();
    } catch {
      setNotice(null);
      setError("Could not update listing status. Please try again.");
    } finally {
      setPendingStatus(null);
    }
  }

  useEffect(() => {
    if (!notice || pendingStatus || error) {
      return undefined;
    }

    const noticeTimeout = window.setTimeout(() => {
      setNotice(null);
    }, LISTING_STATUS_NOTICE_TIMEOUT_MS);

    return () => window.clearTimeout(noticeTimeout);
  }, [error, notice, pendingStatus]);

  return (
    <div className="grid gap-1.5">
      <div className="flex flex-wrap items-center gap-2">
        {actions.map((action) => {
          const isPending = pendingStatus === action.nextStatus;

          return (
            <button
              key={`${status}-${action.nextStatus}`}
              type="button"
              disabled={Boolean(pendingStatus)}
              onClick={() => setConfirmAction(action)}
              className={buttonVariants({
                variant: action.variant ?? "primary",
                size: "sm",
              })}
            >
              {isPending ? "Updating..." : action.label}
            </button>
          );
        })}
      </div>
      {error ? <FormFeedback tone="error">{error}</FormFeedback> : null}
      {notice ? (
        <p
          role="status"
          aria-live="polite"
          className={listingStatusFeedbackClassName(
            pendingStatus ? "info" : "success",
          )}
        >
          {notice}
        </p>
      ) : null}
      {confirmAction && confirmationCopy ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-stone-950/35 px-4 py-8 backdrop-blur-[2px]">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="listing-status-dialog-title"
            aria-describedby="listing-status-dialog-body"
            className="w-full max-w-md rounded-2xl border border-stone-200 bg-surface p-5 shadow-2xl"
          >
            <div className="grid gap-3">
              <div className="grid gap-2">
                <h2
                  id="listing-status-dialog-title"
                  className="font-serif text-2xl font-bold text-stone-950"
                >
                  {confirmationCopy.title}
                </h2>
                <p
                  id="listing-status-dialog-body"
                  className="text-sm leading-6 text-stone-600"
                >
                  {confirmationCopy.body}
                </p>
              </div>
              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void changeStatus(confirmAction)}
                  className={buttonVariants({
                    variant:
                      confirmAction.variant === "danger" ? "danger" : "primary",
                    size: "sm",
                  })}
                >
                  {confirmationCopy.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
