import type { ResumeIndexEntry } from "@lanjut/resume";
import { Button } from "@lanjut/ui/components/button";
import { Card } from "@lanjut/ui/components/card";
import { useIsMobile } from "@lanjut/ui/hooks/use-mobile";
import { ArrowRightIcon, DownloadSimpleIcon } from "@phosphor-icons/react";
import { useId, useState } from "react";
import { useTranslations } from "use-intl";
import { useResumeDocument } from "@/hooks/use-resume-document";
import { Link } from "@/i18n/navigation";
import { editorHref } from "@/lib/routes";
import { TruncatedLabel } from "../shared/truncated-label";
import {
  type ContinueAction,
  PlatformLibraryContinueDrawer,
} from "./platform-library-continue-drawer";
import { PlatformPaperFrame } from "./platform-paper-frame";
import { PlatformResumeActionDelete } from "./platform-resume-action-delete";
import { PlatformResumeActionDownload } from "./platform-resume-action-download";
import { PlatformResumeActionRename } from "./platform-resume-action-rename";
import { PlatformResumeGridItemMenu } from "./platform-resume-grid/platform-resume-grid-item-menu";
import { PlatformResumeMeta } from "./platform-resume-meta";
import { PlatformResumeSheet } from "./platform-resume-sheet";
import { PlatformSectionHeading } from "./platform-section-heading";

/**
 * The résumé edited last, first in the library, one click from the editor.
 * On a phone the card holds no buttons: a tap opens a drawer with the pages
 * and every action.
 */
export function PlatformLibraryContinue(props: { resume: ResumeIndexEntry }) {
  const { resume } = props;
  const t = useTranslations("platform");
  const headingId = useId();
  const isMobile = useIsMobile();
  const document = useResumeDocument(resume.id, resume.updatedAt);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [action, setAction] = useState<ContinueAction | null>(null);
  const href = editorHref(resume.id);

  function closeAction(open: boolean) {
    if (!open) setAction(null);
  }

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <PlatformSectionHeading id={headingId}>
        {t("library.continue")}
      </PlatformSectionHeading>

      <Card className="relative flex-row gap-0 p-1.5">
        <div className="relative w-28 shrink-0 sm:w-60">
          <PlatformPaperFrame>
            <PlatformResumeSheet document={document} />
          </PlatformPaperFrame>
          {!isMobile && (
            <Link
              href={href}
              aria-hidden
              tabIndex={-1}
              className="absolute inset-0 rounded-lg"
            />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-4 px-4 py-2 sm:justify-between sm:px-6 sm:py-4">
          <div className="flex min-w-0 flex-col gap-1">
            <h3 className="min-w-0 text-base font-semibold tracking-tight sm:text-lg">
              {isMobile && (
                <button
                  type="button"
                  aria-label={t("library.preview", { title: resume.title })}
                  onClick={() => setDrawerOpen(true)}
                  className="block w-full cursor-pointer text-left outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
                >
                  <TruncatedLabel text={resume.title} />
                </button>
              )}
              {!isMobile && (
                <Link
                  href={href}
                  className="block rounded-xs hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <TruncatedLabel text={resume.title} />
                </Link>
              )}
            </h3>
            <PlatformResumeMeta
              resume={resume}
              document={document}
              className="sm:text-sm"
            />
          </div>

          {!isMobile && (
            <div className="flex flex-wrap items-center gap-2">
              <Button nativeButton={false} render={<Link href={href} />}>
                {t("library.openEditor")}
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
              <Button variant="outline" onClick={() => setAction("download")}>
                <DownloadSimpleIcon data-icon="inline-start" />
                {t("grid.download")}
              </Button>
              <PlatformResumeGridItemMenu resume={resume} variant="toolbar" />
            </div>
          )}
        </div>
      </Card>

      {isMobile && (
        <PlatformLibraryContinueDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          resume={resume}
          document={document}
          onAction={(next) => {
            setDrawerOpen(false);
            setAction(next);
          }}
        />
      )}

      <PlatformResumeActionDownload
        resume={resume}
        open={action === "download"}
        onOpenChange={closeAction}
      />
      <PlatformResumeActionRename
        key={resume.title}
        resume={resume}
        open={action === "rename"}
        onOpenChange={closeAction}
      />
      <PlatformResumeActionDelete
        resume={resume}
        open={action === "delete"}
        onOpenChange={closeAction}
      />
    </section>
  );
}
