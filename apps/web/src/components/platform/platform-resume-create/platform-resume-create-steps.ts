export const CREATE_STEPS = ["start", "template", "review"] as const;
export type CreateStep = (typeof CREATE_STEPS)[number];

export const CREATE_STEP_LABEL_KEYS: Record<CreateStep, string> = {
  start: "stepStart",
  template: "stepTemplate",
  review: "stepReview",
};

export const CREATE_STEP_NUMBER: Record<CreateStep, number> = {
  start: 1,
  template: 2,
  review: 3,
};

export const NEXT_STEP: Record<CreateStep, CreateStep> = {
  start: "template",
  template: "review",
  review: "review",
};

export const PREVIOUS_STEP: Record<CreateStep, CreateStep> = {
  start: "start",
  template: "start",
  review: "template",
};
