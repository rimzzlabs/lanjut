import { useTranslations } from "use-intl";
import { PlatformLibrary } from "./platform-library";
import { PlatformLibraryTour } from "./platform-library-tour";
import { PlatformPageHeader } from "./platform-page-header";
import { PlatformPageScroll } from "./platform-page-scroll";
import { PlatformResumeToolbar } from "./platform-resume-toolbar";
import { PlatformResumeUnreadableNotice } from "./platform-resume-unreadable-notice";

/** The résumé library: the workspace when no résumé is open. */
export function PlatformDashboard() {
  const t = useTranslations("platform.sidebar");

  return (
    <PlatformPageScroll>
      <PlatformPageHeader title={t("myResume")}>
        <PlatformResumeToolbar />
      </PlatformPageHeader>
      <PlatformResumeUnreadableNotice />
      <PlatformLibrary />
      <PlatformLibraryTour />
    </PlatformPageScroll>
  );
}
