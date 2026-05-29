import type { ReactNode } from "react";

type FormFeedbackProps = {
  tone: "error" | "info" | "success";
  children: ReactNode;
};

const toneClassNames = {
  error: "border-red-200 bg-red-50 text-red-700",
  info: "border-brand-200 bg-brand-50 text-brand-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

export function FormFeedback({ tone, children }: FormFeedbackProps) {
  const isError = tone === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${toneClassNames[tone]}`}
    >
      {children}
    </div>
  );
}
