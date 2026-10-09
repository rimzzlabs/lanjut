import type { ResumeIndexEntry } from "@lanjut/resume";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@lanjut/ui/components/select";
import { A } from "@mobily/ts-belt";
import { useId } from "react";
import { useTranslations } from "use-intl";

/** The source value that shows the sample résumé. No résumé id is empty. */
export const SAMPLE_SOURCE = "";

interface PlatformTemplatePreviewSourceProps {
  value: string;
  onValueChange: (value: string) => void;
  resumes: readonly ResumeIndexEntry[];
}

/** Which content the preview wears: the sample, or one of the saved résumés. */
export function PlatformTemplatePreviewSource(
  props: PlatformTemplatePreviewSourceProps,
) {
  const t = useTranslations();
  const labelId = useId();
  const sample = {
    value: SAMPLE_SOURCE,
    label: t("forms.create.sourceSample"),
  };
  const saved = A.map(props.resumes, (resume) => ({
    value: resume.id,
    label: resume.title,
  }));

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        id={labelId}
        className="shrink-0 text-sm text-muted-foreground max-sm:sr-only"
      >
        {t("platform.templates.previewWith")}
      </span>
      <Select
        items={A.prepend(saved, sample)}
        value={props.value}
        onValueChange={(value) => props.onValueChange(value as string)}
      >
        <SelectTrigger
          size="sm"
          aria-labelledby={labelId}
          className="max-w-56 min-w-0 max-sm:w-full max-sm:max-w-none max-sm:data-[size=sm]:h-9"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={sample.value}>{sample.label}</SelectItem>
          </SelectGroup>
          {A.isNotEmpty(saved) && (
            <>
              <SelectSeparator />
              <SelectGroup>
                {saved.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
