import type { ResumeIndexEntry } from "@lanjut/resume";
import {
  Card,
  CardAction,
  CardHeader,
  CardTitle,
} from "@lanjut/ui/components/card";
import { cn } from "@lanjut/ui/lib/utils";
import { useResumeDocument } from "@/hooks/use-resume-document";
import { Link } from "@/i18n/navigation";
import { editorHref } from "@/lib/routes";
import { TruncatedLabel } from "../../shared/truncated-label";
import { CARD_LINK, CARD_LINK_RING } from "../platform-card-link";
import { PlatformPaperFrame } from "../platform-paper-frame";
import { PlatformResumeMeta } from "../platform-resume-meta";
import { PlatformResumeSheet } from "../platform-resume-sheet";
import { PlatformResumeGridItemMenu } from "./platform-resume-grid-item-menu";

interface PlatformResumeGridItemProps {
  resume: ResumeIndexEntry;
}

/**
 * One résumé as a card. The whole card is one link into the editor (the title
 * stretches over it); only the menu sits above it.
 */
export function PlatformResumeGridItem(props: PlatformResumeGridItemProps) {
  const { resume } = props;
  const document = useResumeDocument(resume.id, resume.updatedAt);

  return (
    <Card size="sm" className={cn("relative gap-3 p-1.5 pb-3", CARD_LINK_RING)}>
      <PlatformPaperFrame>
        <PlatformResumeSheet document={document} />
      </PlatformPaperFrame>

      <CardHeader className="px-2.5">
        <CardTitle className="min-w-0">
          <Link href={editorHref(resume.id)} className={CARD_LINK}>
            <TruncatedLabel text={resume.title} />
          </Link>
        </CardTitle>
        <PlatformResumeMeta resume={resume} document={document} />
        <CardAction className="relative z-10">
          <PlatformResumeGridItemMenu resume={resume} />
        </CardAction>
      </CardHeader>
    </Card>
  );
}
