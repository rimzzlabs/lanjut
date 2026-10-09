import { SEED_RESUME } from "@lanjut/resume";
import {
  filterTemplates,
  SORTED_TEMPLATES,
  type TemplateId,
} from "@lanjut/resume/templates";
import { A, O, pipe, S } from "@mobily/ts-belt";
import { useMemo, useState } from "react";
import { useTranslations } from "use-intl";
import {
  isResumePreviewEmpty,
  resumeToPreview,
} from "@/components/editor/resume-to-preview";
import { useHydrateResumeLibrary } from "@/hooks/use-hydrate-resume-library";
import { MEDIA_LG, useMediaQuery } from "@/hooks/use-media-query";
import { useProfileResumes } from "@/hooks/use-profile-resumes";
import { useResumeDocument } from "@/hooks/use-resume-document";
import {
  useSelectedTemplate,
  useTemplateSearchQuery,
} from "@/hooks/use-template-search";
import { PlatformTemplateCards } from "./platform-template-cards/platform-template-cards";
import { PlatformTemplateDialog } from "./platform-template-dialog";
import { PlatformTemplateList } from "./platform-template-list/platform-template-list";
import { PlatformTemplatePreview } from "./platform-template-preview/platform-template-preview";
import { SAMPLE_SOURCE } from "./platform-template-preview/platform-template-preview-source";

const SEED_PREVIEW = resumeToPreview(SEED_RESUME);

/**
 * Pick a template, then see it at full size on the sample or on one of your
 * own résumés. From `lg` the list sits beside the preview and stays in view
 * while the pages scroll. Below `lg` the templates are cards, and a card opens
 * its preview in a dialog.
 */
export function PlatformTemplateBrowser() {
  useHydrateResumeLibrary();
  const t = useTranslations("platform.templates");
  const wide = useMediaQuery(MEDIA_LG);
  const [query] = useTemplateSearchQuery();
  const [templateId, setTemplateId] = useSelectedTemplate();
  const [source, setSource] = useState(SAMPLE_SOURCE);
  const [dialogOpen, setDialogOpen] = useState(false);
  const index = useProfileResumes();
  const target = pipe(
    index,
    A.find((resume) => resume.id === source),
  );
  const document = useResumeDocument(
    O.mapWithDefault(target, "", (resume) => resume.id),
    O.mapWithDefault(target, "", (resume) => resume.updatedAt),
  );
  const preview = useMemo(() => {
    if (O.isNone(target)) return SEED_PREVIEW;
    if (!document) return null;
    return resumeToPreview(document);
  }, [target, document]);
  // Tiles of a blank résumé would all look the same, so they keep the sample.
  const tilePreview =
    preview && !isResumePreviewEmpty(preview) ? preview : SEED_PREVIEW;

  const templates = A.map(SORTED_TEMPLATES, (template) => ({
    ...template,
    description: t(`descriptions.${template.id}`),
  }));
  const results = filterTemplates(templates, query);
  const selected = A.find(templates, (template) => template.id === templateId);

  if (O.isNone(selected)) return null;

  const previewProps = {
    template: selected,
    preview,
    source: O.isNone(target) ? SAMPLE_SOURCE : source,
    onSourceChange: setSource,
    resumes: index,
    target: O.toUndefined(target),
    document,
  };

  if (!wide) {
    return (
      <>
        <PlatformTemplateCards
          templates={results}
          preview={tilePreview}
          query={S.trim(query)}
          onOpen={(id: TemplateId) => {
            void setTemplateId(id);
            setDialogOpen(true);
          }}
        />
        <PlatformTemplateDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          {...previewProps}
        />
      </>
    );
  }

  return (
    <div className="grid grid-cols-[18rem_minmax(0,1fr)] items-start gap-6">
      <div className="sticky top-6">
        <PlatformTemplateList
          templates={results}
          value={templateId}
          onValueChange={setTemplateId}
          preview={tilePreview}
          query={S.trim(query)}
        />
      </div>

      <PlatformTemplatePreview variant="card" {...previewProps} />
    </div>
  );
}
