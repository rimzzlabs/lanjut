import type { TemplateId } from "@lanjut/resume/templates";
import type { Ref } from "react";
import { useTranslations } from "use-intl";
import type { ResumePreview } from "@/components/editor/resume-preview";
import { MEDIA_LG, useMediaQuery } from "@/hooks/use-media-query";
import { PlatformResumeCreateStepHeading } from "./platform-resume-create-step-heading";
import { PlatformResumeCreateTemplateCarousel } from "./platform-resume-create-template-carousel";
import { PlatformResumeCreateTemplateList } from "./platform-resume-create-template-list";

interface PlatformResumeCreateTemplateProps {
  value: TemplateId;
  onValueChange: (template: TemplateId) => void;
  preview: ResumePreview | null;
  headingRef: Ref<HTMLHeadingElement>;
}

/**
 * Step two: the look. From the `lg` breakpoint a list sits beside the large
 * preview; below it, a carousel of page-wide previews takes its place.
 */
export function PlatformResumeCreateTemplate(
  props: PlatformResumeCreateTemplateProps,
) {
  const t = useTranslations("forms.create");
  const wide = useMediaQuery(MEDIA_LG);

  return (
    <div className="flex flex-col gap-4">
      <PlatformResumeCreateStepHeading
        ref={props.headingRef}
        title={t("template")}
        hint={t("templateHint")}
      />

      {props.preview && wide && (
        <PlatformResumeCreateTemplateList
          value={props.value}
          onValueChange={props.onValueChange}
          preview={props.preview}
          label={t("template")}
        />
      )}
      {props.preview && wide === false && (
        <PlatformResumeCreateTemplateCarousel
          value={props.value}
          onValueChange={props.onValueChange}
          preview={props.preview}
          label={t("template")}
        />
      )}
    </div>
  );
}
