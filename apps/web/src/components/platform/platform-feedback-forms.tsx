import { Spinner } from "@lanjut/ui/components/spinner";
import { lazy } from "react";

// Both forms carry TipTap, so they load on demand, not with every platform page.
export function preloadBugReportForm() {
  return import("../feedback/feedback-bug-report-form");
}

export function preloadFeatureRequestForm() {
  return import("../feedback/feedback-feature-request-form");
}

function loadBugReportForm() {
  return preloadBugReportForm().then((module) => ({
    default: module.FeedbackBugReportForm,
  }));
}

function loadFeatureRequestForm() {
  return preloadFeatureRequestForm().then((module) => ({
    default: module.FeedbackFeatureRequestForm,
  }));
}

export const LazyBugReportForm = lazy(loadBugReportForm);
export const LazyFeatureRequestForm = lazy(loadFeatureRequestForm);

export function PlatformFeedbackFormFallback() {
  return (
    <div className="flex min-h-48 items-center justify-center text-muted-foreground">
      <Spinner />
    </div>
  );
}
