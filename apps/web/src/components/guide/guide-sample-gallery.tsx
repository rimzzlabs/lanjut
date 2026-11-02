import { type ResumeLanguage, SAMPLE_RESUMES } from "@lanjut/resume";
import type { TemplateId } from "@lanjut/resume/templates";
import { ScrollArea } from "@lanjut/ui/components/scroll-area";
import { A, O, pipe } from "@mobily/ts-belt";
import { useMemo, useState } from "react";
import { resumeToPreview } from "@/components/editor/resume-to-preview";
import { resumeToText } from "@/components/editor/resume-to-text";
import { IslandProviders } from "@/components/shared/island-providers";
import type { IslandProps } from "@/components/shared/providers";
import { GuideSampleItem, GuideSampleMore } from "./guide-sample-item";
import type {
  GuideSampleLabels,
  GuideSampleTemplate,
} from "./guide-sample-types";
import { GuideTemplatePreview } from "./guide-template-preview";

interface GuideSampleGalleryProps extends IslandProps {
  language: ResumeLanguage;
  plainTextLabel: string;
  templates: ReadonlyArray<GuideSampleTemplate>;
  templatesHref: string;
  labels: GuideSampleLabels;
}

/**
 * The language's sample résumé in five templates, each opening a full-size
 * preview, then a tile to all of them, then the same résumé as the plain text
 * an applicant tracking system works from.
 */
export function GuideSampleGallery(props: GuideSampleGalleryProps) {
  return (
    <IslandProviders locale={props.locale} pathname={props.pathname}>
      <GuideSampleGalleryBody {...props} />
    </IslandProviders>
  );
}

function GuideSampleGalleryBody(props: GuideSampleGalleryProps) {
  const preview = useMemo(
    () => resumeToPreview(SAMPLE_RESUMES[props.language]),
    [props.language],
  );
  // The template stays set while the preview slides closed, so its pages
  // do not vanish mid-animation.
  const [shown, setShown] = useState<TemplateId | null>(null);
  const [open, setOpen] = useState(false);
  const template = pipe(
    O.fromNullable(shown),
    O.flatMap((id) => A.find(props.templates, (item) => item.id === id)),
  );

  return (
    <div className="flex flex-col gap-8">
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {props.templates.map((template) => (
          <GuideSampleItem
            key={template.id}
            template={template}
            preview={preview}
            openLabel={props.labels.open}
            onOpen={() => {
              setShown(template.id);
              setOpen(true);
            }}
          />
        ))}
        <GuideSampleMore
          href={props.templatesHref}
          label={props.labels.allTemplates}
        />
      </ul>
      <figure className="flex flex-col gap-2">
        <figcaption className="text-sm font-medium">
          {props.plainTextLabel}
        </figcaption>
        <ScrollArea data-nosnippet className="h-96 rounded-xl bg-(--ink)">
          <pre className="p-5 font-machine text-xs leading-[1.8] whitespace-pre-wrap text-(--machine-muted)">
            {resumeToText(preview)}
          </pre>
        </ScrollArea>
      </figure>
      <GuideTemplatePreview
        open={open}
        template={O.toUndefined(template)}
        preview={preview}
        templatesHref={props.templatesHref}
        useLabel={props.labels.useTemplate}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
