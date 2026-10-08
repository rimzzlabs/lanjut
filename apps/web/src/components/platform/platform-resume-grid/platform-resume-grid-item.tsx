import type { ResumeIndexEntry } from "@lanjut/resume";
import {
  Card,
  CardAction,
  CardHeader,
  CardTitle,
} from "@lanjut/ui/components/card";
import { useTranslations } from "use-intl";
import { useResumeDocument } from "@/hooks/use-resume-document";
import { Link } from "@/i18n/navigation";
import { editorHref } from "@/lib/routes";
import { TruncatedLabel } from "../../shared/truncated-label";
import { PlatformPaperFrame } from "../platform-paper-frame";
import { PlatformResumeMeta } from "../platform-resume-meta";
import { PlatformResumeSheet } from "../platform-resume-sheet";
import { PlatformResumeGridItemMenu } from "./platform-resume-grid-item-menu";

interface PlatformResumeGridItemProps {
  resume: ResumeIndexEntry;
}

export function PlatformResumeGridItem(props: PlatformResumeGridItemProps) {
  const { resume } = props;
  const t = useTranslations("platform.grid");
  const document = useResumeDocument(resume.id, resume.updatedAt);
  const href = editorHref(resume.id);

  return (
    <Card size="sm" className="gap-3 p-1.5 pb-3">
      <div className="relative">
        <PlatformPaperFrame>
          <PlatformResumeSheet document={document} />
        </PlatformPaperFrame>
        <Link
          href={href}
          aria-label={t("open", { title: resume.title })}
          className="absolute inset-0 rounded-lg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        />
      </div>

      <CardHeader className="px-2.5">
        <CardTitle className="min-w-0">
          <Link
            href={href}
            className="block rounded-xs hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <TruncatedLabel text={resume.title} />
          </Link>
        </CardTitle>
        <PlatformResumeMeta resume={resume} document={document} />
        <CardAction>
          <PlatformResumeGridItemMenu resume={resume} />
        </CardAction>
      </CardHeader>
    </Card>
  );
}
