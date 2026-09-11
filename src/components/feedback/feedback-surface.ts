/**
 * Where a feedback form is mounted. The dialog caps its own height and scrolls
 * the fields inside it; the page has no height to cap, so the same classes
 * would collapse the form to nothing and it lets the fields flow instead.
 */
export type FeedbackSurface = "dialog" | "page";

export const FEEDBACK_SURFACE_CLASS: Record<
  FeedbackSurface,
  { form: string; fields: string }
> = {
  dialog: {
    form: "md:grid md:min-h-0 md:flex-1 md:grid-rows-[minmax(0,1fr)_auto]",
    fields: "md:-mr-2 md:min-h-0 md:pr-2",
  },
  page: { form: "", fields: "" },
};
