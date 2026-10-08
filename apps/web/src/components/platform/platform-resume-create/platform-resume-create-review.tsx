import type { TemplateId } from "@lanjut/resume/templates";
import { Button } from "@lanjut/ui/components/button";
import { Field, FieldError, FieldLabel } from "@lanjut/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@lanjut/ui/components/input-group";
import { TextTIcon } from "@phosphor-icons/react";
import { type Control, Controller } from "react-hook-form";
import { useTranslations } from "use-intl";
import type { ResumePreview } from "@/components/editor/resume-preview";
import { ResumeThumbnail } from "@/components/editor/resume-thumbnail";
import {
  RESUME_TITLE_MAX_LENGTH,
  type ResumeCreateForm,
} from "@/lib/forms/resume";
import { PlatformResumeCreateStepHeading } from "./platform-resume-create-step-heading";

interface PlatformResumeCreateReviewProps {
  control: Control<ResumeCreateForm>;
  sourceLabel: string;
  templateName: string;
  onEditSource: () => void;
  onEditTemplate: () => void;
  preview: ResumePreview | null;
  template: TemplateId;
}

/**
 * Step three: the name, the choices so far with a way back to each, and below
 * the `lg` breakpoint the first page as it will open in the editor.
 */
export function PlatformResumeCreateReview(
  props: PlatformResumeCreateReviewProps,
) {
  const t = useTranslations("forms.create");

  return (
    <div className="flex flex-col gap-5">
      <PlatformResumeCreateStepHeading
        title={t("stepReview")}
        hint={t("reviewHint")}
      />

      <Controller
        control={props.control}
        name="title"
        render={(controller) => {
          const { field, fieldState } = controller;
          return (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="create-resume-title">
                {t("label")}
              </FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <TextTIcon />
                </InputGroupAddon>
                <InputGroupInput
                  id="create-resume-title"
                  maxLength={RESUME_TITLE_MAX_LENGTH}
                  placeholder={t("placeholder")}
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
              </InputGroup>
              <FieldError errors={[fieldState.error]} />
            </Field>
          );
        }}
      />

      <dl className="divide-y rounded-xl border">
        <ReviewChoice
          term={t("sourceLabel")}
          value={props.sourceLabel}
          onChange={props.onEditSource}
        />
        <ReviewChoice
          term={t("template")}
          value={props.templateName}
          onChange={props.onEditTemplate}
        />
      </dl>

      {props.preview && (
        <div className="mx-auto w-full max-w-xs overflow-hidden rounded-sm bg-white shadow-sm ring-1 ring-black/5 lg:hidden">
          <ResumeThumbnail resume={props.preview} template={props.template} />
        </div>
      )}
    </div>
  );
}

function ReviewChoice(props: {
  term: string;
  value: string;
  onChange: () => void;
}) {
  const t = useTranslations("forms.create");

  return (
    <div className="flex items-center gap-3 py-2 pr-2 pl-3">
      <dt className="text-sm text-muted-foreground">{props.term}</dt>
      <dd className="ml-auto text-sm font-medium">{props.value}</dd>
      <dd>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={props.onChange}
        >
          {t("change")}
          <span className="sr-only">{props.term}</span>
        </Button>
      </dd>
    </div>
  );
}
