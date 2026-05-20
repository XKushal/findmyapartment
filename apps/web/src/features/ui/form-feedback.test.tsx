import { describe, expect, it } from "vitest";

import { FormFeedback } from "@/features/ui/form-feedback";

describe("FormFeedback", () => {
  it("renders errors as alerts", () => {
    const feedback = FormFeedback({
      tone: "error",
      children: "Could not save.",
    });

    expect(feedback.props.role).toBe("alert");
    expect(feedback.props.children).toBe("Could not save.");
    expect(feedback.props.className).toContain("border-red-200");
  });

  it("renders progress and success as live status messages", () => {
    const feedback = FormFeedback({
      tone: "success",
      children: "Saved.",
    });

    expect(feedback.props.role).toBe("status");
    expect(feedback.props["aria-live"]).toBe("polite");
    expect(feedback.props.children).toBe("Saved.");
    expect(feedback.props.className).toContain("border-emerald-200");
  });
});
