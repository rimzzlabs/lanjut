import { type ResumeLanguage, SAMPLE_RESUMES } from "@lanjut/resume";
import { TEMPLATES } from "@lanjut/resume/templates";
import { ScrollArea } from "@lanjut/ui/components/scroll-area";
import { ResumeThumbnail } from "@/components/editor/resume-thumbnail";
import { resumeToPreview } from "@/components/editor/resume-to-preview";
import { resumeToText } from "@/components/editor/resume-to-text";

interface GuideSampleGalleryProps {
  language: ResumeLanguage;
  plainTextLabel: string;
}

/**
 * The language's sample résumé in every template, then the same résumé as
 * the plain text an applicant tracking system works from.
 */
export function GuideSampleGallery(props: GuideSampleGalleryProps) {
  const preview = resumeToPreview(SAMPLE_RESUMES[props.language]);

  return (
    <div className="flex flex-col gap-8">
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {TEMPLATES.map((template) => (
          <GuideSampleItem
            key={template.id}
            name={template.name}
            template={template.id}
            preview={preview}
          />
        ))}
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
    </div>
  );
}

interface GuideSampleItemProps {
  name: string;
  template: (typeof TEMPLATES)[number]["id"];
  preview: ReturnType<typeof resumeToPreview>;
}

function GuideSampleItem(props: GuideSampleItemProps) {
  return (
    <li className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-lg bg-white ring-1 ring-foreground/10">
        <ResumeThumbnail resume={props.preview} template={props.template} />
      </div>
      <span className="text-sm font-medium">{props.name}</span>
    </li>
  );
}
