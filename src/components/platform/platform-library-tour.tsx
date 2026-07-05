"use client";

import { useResumeCreateDialog } from "@/hooks/use-resume-create-dialog";
import { LIBRARY_TOUR } from "@/lib/tour";
import { TourAutostart } from "../tour/tour-autostart";

/**
 * Holds the library tour back while the create dialog is deep-linked open
 * (`/platform?create=true`): the user arrived with an explicit goal, so the
 * dialog wins. The tour is deferred, not skipped — mounting TourAutostart on
 * close starts it if the user cancels, and saving routes to the editor where
 * the editor tour takes over.
 */
export function PlatformLibraryTour() {
  const [createOpen] = useResumeCreateDialog();

  if (createOpen) return null;
  return <TourAutostart tour={LIBRARY_TOUR} />;
}
