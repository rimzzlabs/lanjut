import type { ResumeIndexEntry } from "@lanjut/resume";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@lanjut/ui/components/item";
import { useResumeDocument } from "@/hooks/use-resume-document";
import { Link } from "@/i18n/navigation";
import { editorHref } from "@/lib/routes";
import { TruncatedLabel } from "../../shared/truncated-label";
import { PlatformResumeGridItemMenu } from "../platform-resume-grid/platform-resume-grid-item-menu";
import { PlatformResumeMeta } from "../platform-resume-meta";
import { PlatformResumeSheet } from "../platform-resume-sheet";

interface PlatformResumeListItemProps {
  resume: ResumeIndexEntry;
}

/**
 * One résumé as a row. The title link stretches over the whole row, and the
 * menu sits above it, so a click anywhere but the menu opens the editor. The
 * sheet sits 6px inside the `rounded-lg` row, so `rounded-sm` keeps the
 * corners concentric.
 */
export function PlatformResumeListItem(props: PlatformResumeListItemProps) {
  const { resume } = props;
  const document = useResumeDocument(resume.id, resume.updatedAt);

  return (
    <Item
      render={<li />}
      size="sm"
      className="relative flex-nowrap rounded-lg p-1.5 pr-2 hover:bg-muted/60 has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/50"
    >
      <ItemMedia className="w-10 overflow-hidden rounded-sm bg-white shadow-xs ring-1 ring-black/5">
        <PlatformResumeSheet document={document} />
      </ItemMedia>

      <ItemContent className="min-w-0 gap-0.5">
        <ItemTitle className="w-full min-w-0">
          <Link
            href={editorHref(resume.id)}
            className="block min-w-0 outline-none after:absolute after:inset-0"
          >
            <TruncatedLabel text={resume.title} />
          </Link>
        </ItemTitle>
        <PlatformResumeMeta resume={resume} document={document} />
      </ItemContent>

      <ItemActions className="relative">
        <PlatformResumeGridItemMenu resume={resume} />
      </ItemActions>
    </Item>
  );
}
