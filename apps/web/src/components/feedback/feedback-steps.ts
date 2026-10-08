export const FEEDBACK_STEPS = ["kind", "details", "review"] as const;
export type FeedbackStep = (typeof FEEDBACK_STEPS)[number];

export const FEEDBACK_STEP_NUMBER: Record<FeedbackStep, number> = {
  kind: 1,
  details: 2,
  review: 3,
};

export const NEXT_STEP: Record<FeedbackStep, FeedbackStep> = {
  kind: "details",
  details: "review",
  review: "review",
};

export const PREVIOUS_STEP: Record<FeedbackStep, FeedbackStep> = {
  kind: "kind",
  details: "kind",
  review: "details",
};
