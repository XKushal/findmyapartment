import type { ReactNode } from "react";

import { cn, type ClassValue } from "@/features/ui/cn";

type CardProps = {
  children: ReactNode;
  className?: ClassValue;
  as?: "div" | "article" | "section" | "form";
  interactive?: boolean;
};

/** Surface container with the warm-wood border + soft shadow treatment. */
export function Card({
  children,
  className,
  as: Tag = "div",
  interactive = false,
}: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-2xl border border-stone-200/80 bg-surface shadow-[var(--shadow-soft)]",
        interactive &&
          "transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[var(--shadow-lift)]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/** Section eyebrow label — small uppercase brand text above a heading. */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: ClassValue;
}) {
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.18em] text-brand-700",
        className,
      )}
    >
      {children}
    </p>
  );
}
