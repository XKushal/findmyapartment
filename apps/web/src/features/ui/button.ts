import { cn, type ClassValue } from "@/features/ui/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "subtle";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium " +
  "transition-all duration-150 ease-out focus-visible:outline-none " +
  "disabled:cursor-not-allowed disabled:opacity-60 active:translate-y-px " +
  "whitespace-nowrap";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-800 text-brand-50 shadow-[var(--shadow-soft)] hover:bg-brand-900",
  secondary:
    "border border-stone-300 bg-surface text-stone-900 hover:border-stone-400 hover:bg-stone-50",
  subtle:
    "bg-brand-100 text-brand-900 hover:bg-brand-200",
  ghost: "text-stone-700 hover:bg-stone-100 hover:text-stone-950",
  danger:
    "border border-red-200 bg-surface text-red-700 hover:border-red-300 hover:bg-red-50",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

type ButtonVariantOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: ClassValue;
};

/**
 * Shared button styling used by both <button> elements and <Link>
 * call-to-actions so primary/secondary/ghost treatments stay consistent.
 */
export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: ButtonVariantOptions = {}): string {
  return cn(base, variants[variant], sizes[size], className);
}
