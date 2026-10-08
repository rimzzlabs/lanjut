import type { ParseResult } from "@lanjut/resume/import";
import { RadioCard } from "@lanjut/ui/components/radio-card";
import { RadioGroup } from "@lanjut/ui/components/radio-group";
import {
  CheckIcon,
  FileArrowUpIcon,
  FileDashedIcon,
  FileTextIcon,
  type Icon,
} from "@phosphor-icons/react";
import type { Ref } from "react";
import { type Control, Controller } from "react-hook-form";
import { useTranslations } from "use-intl";
import type { ResumeCreateForm, ResumeSource } from "@/lib/forms/resume";
import { ResumeImportDisclaimer } from "../../shared/resume-import-disclaimer";
import { PlatformResumeImportDropzone } from "../platform-resume-import-dropzone";
import { PlatformResumeCreateProfileNote } from "./platform-resume-create-profile-note";
import { PlatformResumeCreateStepHeading } from "./platform-resume-create-step-heading";

interface SourceOption {
  value: ResumeSource;
  labelKey: string;
  hintKey: string;
  icon: Icon;
}

const SOURCES: ReadonlyArray<SourceOption> = [
  {
    value: "sample",
    labelKey: "sourceSample",
    hintKey: "sourceSampleHint",
    icon: FileTextIcon,
  },
  {
    value: "empty",
    labelKey: "sourceEmpty",
    hintKey: "sourceEmptyHint",
    icon: FileDashedIcon,
  },
  {
    value: "import",
    labelKey: "sourceImport",
    hintKey: "sourceImportHint",
    icon: FileArrowUpIcon,
  },
];

interface PlatformResumeCreateStartProps {
  control: Control<ResumeCreateForm>;
  source: ResumeSource;
  onSourceChange: (source: ResumeSource) => void;
  onParsingChange: (parsing: boolean) => void;
  onParsed: (file: File, result: ParseResult) => void;
  onCleared: () => void;
  headingRef: Ref<HTMLHeadingElement>;
}

/** Step one: where the new résumé's content comes from. */
export function PlatformResumeCreateStart(
  props: PlatformResumeCreateStartProps,
) {
  const t = useTranslations("forms.create");

  return (
    <div className="flex flex-col gap-4">
      <PlatformResumeCreateStepHeading
        ref={props.headingRef}
        title={t("sourceLabel")}
      />

      <Controller
        control={props.control}
        name="source"
        render={(controller) => {
          const { field } = controller;
          return (
            <RadioGroup
              aria-label={t("sourceLabel")}
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                props.onSourceChange(value as ResumeSource);
              }}
              className="gap-2"
            >
              {SOURCES.map((option) => (
                <SourceCard key={option.value} option={option} />
              ))}
            </RadioGroup>
          );
        }}
      />

      <PlatformResumeCreateProfileNote source={props.source} />

      {props.source === "import" && (
        <div className="flex flex-col gap-3">
          <ResumeImportDisclaimer />
          <PlatformResumeImportDropzone
            onParsingChange={props.onParsingChange}
            onParsed={props.onParsed}
            onCleared={props.onCleared}
          />
        </div>
      )}
    </div>
  );
}

function SourceCard(props: { option: SourceOption }) {
  const t = useTranslations("forms.create");
  const SourceIcon = props.option.icon;

  return (
    <RadioCard
      value={props.option.value}
      className="flex-row items-center gap-3 p-3"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-sm border bg-muted/60 text-muted-foreground transition-colors group-data-checked/radio-card:border-primary/30 group-data-checked/radio-card:bg-primary/10 group-data-checked/radio-card:text-primary">
        <SourceIcon className="size-5" />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm font-medium">{t(props.option.labelKey)}</span>
        <span className="text-xs text-muted-foreground">
          {t(props.option.hintKey)}
        </span>
      </span>
      <CheckIcon
        weight="bold"
        className="ml-auto size-4 shrink-0 text-primary opacity-0 transition-opacity group-data-checked/radio-card:opacity-100"
      />
    </RadioCard>
  );
}
