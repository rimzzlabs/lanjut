import type { ResumeIndexEntry } from "@lanjut/resume";
import { Card } from "@lanjut/ui/components/card";
import { useIsMobile } from "@lanjut/ui/hooks/use-mobile";
import { cn } from "@lanjut/ui/lib/utils";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { useId, useState } from "react";
import { useTranslations } from "use-intl";
import { preloadPdfExportById } from "@/components/editor/preload-pdf-export";
import { useResumeDocument } from "@/hooks/use-resume-document";
import { Link } from "@/i18n/navigation";
import { editorHref } from "@/lib/routes";
import { TruncatedLabel } from "../shared/truncated-label";
import { CARD_LINK, CARD_LINK_RING } from "./platform-card-link";
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
 * The résumé edited last, first in the library. The whole card is one link
 * into the editor (the title stretches over it), so there is no button inside
 * the card to compete with it; the other actions sit in the corner menu. On a
 * phone a tap opens a drawer with the pages and every action instead.
 */
export function PlatformLibraryContinue(props: { resume: ResumeIndexEntry }) {
  const { resume } = props;
  const t = useTranslations("platform");
  const headingId = useId();
  const isMobile = useIsMobile();
  const document = useResumeDocument(resume.id, resume.updatedAt);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [action, setAction] = useState<ContinueAction | null>(null);

  function closeAction(open: boolean) {
    if (!open) setAction(null);
  }

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <PlatformSectionHeading id={headingId}>
        {t("library.continue")}
      </PlatformSectionHeading>

      <Card className={cn("relative flex-row gap-0 p-1.5", CARD_LINK_RING)}>
        <div className="w-28 shrink-0 sm:w-60">
          <PlatformPaperFrame>
            <PlatformResumeSheet document={document} />
          </PlatformPaperFrame>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-4 px-4 py-2 sm:justify-between sm:px-6 sm:py-4">
          <div className="flex min-w-0 flex-col gap-1 md:pr-10">
            <h3 className="min-w-0 text-base font-semibold tracking-tight sm:text-lg">
              {isMobile && (
                <button
                  type="button"
                  aria-label={t("library.preview", { title: resume.title })}
                  onClick={() => setDrawerOpen(true)}
                  className={cn(CARD_LINK, "w-full cursor-pointer text-left")}
                >
                  <TruncatedLabel text={resume.title} />
                </button>
              )}
              {!isMobile && (
                <Link href={editorHref(resume.id)} className={CARD_LINK}>
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

          <span
            aria-hidden
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary max-md:hidden"
          >
            {t("library.openEditor")}
            <ArrowRightIcon className="size-4 transition-transform group-hover/card:translate-x-0.5" />
          </span>
        </div>

        {!isMobile && (
          <div className="absolute top-3 right-3 z-10">
            <PlatformResumeGridItemMenu resume={resume} />
          </div>
        )}
      </Card>

      {isMobile && (
        <PlatformLibraryContinueDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          resume={resume}
          document={document}
          onAction={(next) => {
            if (next === "download") preloadPdfExportById(resume.id);
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
