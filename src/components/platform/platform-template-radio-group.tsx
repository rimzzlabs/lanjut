"use client";

import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { CheckIcon } from "lucide-react";
import { ResumeThumbnail } from "@/components/editor/resume-thumbnail";
import { resumeToPreview } from "@/components/editor/resume-to-preview";
import { RadioGroup } from "@/components/ui/radio-group";
import { SEED_RESUME } from "@/lib/resume";
import {
  SORTED_TEMPLATES,
  type TemplateId,
  type TemplateSummary,
} from "@/lib/templates";

const SEED_PREVIEW = resumeToPreview(SEED_RESUME);

const DOTTED_SURFACE =
  "bg-[radial-gradient(color-mix(in_oklab,var(--color-foreground)_7%,transparent)_1px,transparent_1px)] bg-size-[0.5rem_0.5rem]";

interface PlatformTemplateRadioGroupProps {
  value: TemplateId;
  onValueChange: (next: TemplateId) => void;
}

export function PlatformTemplateRadioGroup(
  props: PlatformTemplateRadioGroupProps,
) {
  return (
    <RadioGroup
      value={props.value}
      onValueChange={(value) => props.onValueChange(value as TemplateId)}
      className="grid grid-cols-2 gap-2.5 sm:grid-cols-3"
    >
      {SORTED_TEMPLATES.map((template) => (
        <PlatformTemplateRadioCard key={template.id} template={template} />
      ))}
    </RadioGroup>
  );
}

function PlatformTemplateRadioCard(props: { template: TemplateSummary }) {
  return (
    <RadioPrimitive.Root
      value={props.template.id}
      aria-label={props.template.name}
      className="group/tpl flex cursor-pointer flex-col gap-1.5 rounded-xl border bg-card p-1.5 text-left outline-none transition-colors hover:border-ring/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 data-checked:border-primary data-checked:ring-1 data-checked:ring-primary"
    >
      <div
        className={`relative aspect-4/3 overflow-hidden rounded-lg border bg-muted/40 ${DOTTED_SURFACE}`}
      >
        <div className="absolute inset-x-3 top-3 overflow-hidden rounded-xs bg-white shadow-sm ring-1 ring-black/5">
          <ResumeThumbnail resume={SEED_PREVIEW} template={props.template.id} />
        </div>
        <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-sm transition-opacity group-data-checked/tpl:opacity-100">
          <CheckIcon className="size-3" />
        </span>
      </div>
      <span className="px-1 text-xs font-medium group-data-checked/tpl:text-primary">
        {props.template.name}
      </span>
    </RadioPrimitive.Root>
  );
}
