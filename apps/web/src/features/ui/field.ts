import { cn, type ClassValue } from "@/features/ui/cn";

/**
 * Shared form-control styling. Forms keep their existing DOM/labels/names
 * (covered by tests) and just adopt these class strings for a consistent,
 * warm look with on-brand focus states.
 */
const controlBase =
  "w-full rounded-xl border border-stone-300 bg-surface px-3.5 py-2.5 text-sm " +
  "text-stone-900 shadow-sm outline-none transition-colors " +
  "placeholder:text-stone-400 " +
  "focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 " +
  "disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500";

export function fieldInput(className?: ClassValue): string {
  return cn(controlBase, className);
}

/* Custom chevron so `appearance-none` selects keep a clear dropdown affordance. */
const selectChevron =
  "appearance-none bg-no-repeat pr-10 " +
  "[background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2378716c%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22m6 9 6 6 6-6%22/></svg>')] " +
  "[background-position:right_0.75rem_center] [background-size:1rem]";

export function fieldSelect(className?: ClassValue): string {
  return cn(controlBase, selectChevron, className);
}

export function fieldTextarea(className?: ClassValue): string {
  return cn(controlBase, "resize-y leading-6", className);
}

export function fieldLabel(className?: ClassValue): string {
  return cn("text-sm font-medium text-stone-800", className);
}
