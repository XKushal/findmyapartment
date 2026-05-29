import type { ReactNode } from "react";

import { cn, type ClassValue } from "@/features/ui/cn";

type ContainerProps = {
  children: ReactNode;
  className?: ClassValue;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
};

/** Centered page gutter with consistent horizontal padding. */
export function Container({ children, className, size = "lg" }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full px-5 sm:px-8", sizes[size], className)}>
      {children}
    </div>
  );
}
