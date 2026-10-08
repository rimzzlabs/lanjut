import { useResumeCreateSheet } from "@/hooks/use-resume-create-sheet";
import { LIBRARY_TOUR } from "@/lib/tour";
import { TourAutostart } from "../tour/tour-autostart";

/**
 * Holds the library tour back while the create sheet is deep-linked open
 * (`/editor?create=true`): the user arrived with an explicit goal, so the
 * dialog wins. The tour is deferred, not skipped; mounting TourAutostart on
 * close starts it if the user cancels, and saving routes to the editor where
 * the editor tour takes over.
 */
export function PlatformLibraryTour() {
  const [createOpen] = useResumeCreateSheet();

  if (createOpen) return null;
  return <TourAutostart tour={LIBRARY_TOUR} />;
}
