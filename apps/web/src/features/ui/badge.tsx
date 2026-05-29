import type { ReactNode } from "react";

import { cn, type ClassValue } from "@/features/ui/cn";

export type BadgeTone =
  | "brand"
  | "neutral"
  | "success"
  | "muted"
  | "outline";

const tones: Record<BadgeTone, string> = {
  brand: "bg-brand-100 text-brand-900",
  neutral: "bg-stone-900 text-stone-50",
  success: "bg-emerald-100 text-emerald-900",
  muted: "bg-stone-100 text-stone-600",
  outline: "border border-stone-300 text-stone-700",
};

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  className?: ClassValue;
};

/** Small status / category pill. */
export function Badge({ children, tone = "brand", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const LISTING_TYPE_LABELS: Record<string, string> = {
  APARTMENT: "Apartment",
  ROOM: "Room",
  ROOMMATE: "Roommate",
};

export function listingTypeLabel(type: string): string {
  return LISTING_TYPE_LABELS[type] ?? type;
}

const LISTING_STATUS_TONE: Record<string, BadgeTone> = {
  ACTIVE: "success",
  DRAFT: "muted",
  RENTED: "neutral",
  ARCHIVED: "muted",
};

export function listingStatusTone(status: string): BadgeTone {
  return LISTING_STATUS_TONE[status] ?? "muted";
}
