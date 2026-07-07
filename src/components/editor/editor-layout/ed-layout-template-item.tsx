"use client";

import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { CheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { TemplateSummary } from "@/lib/templates";
import type { ResumePreview } from "../resume-preview";
import { ResumeThumbnail } from "../resume-thumbnail";

interface EditorLayoutTemplateItemProps {
  template: TemplateSummary;
  preview: ResumePreview;
}

export function EditorLayoutTemplateItem(props: EditorLayoutTemplateItemProps) {
  const t = useTranslations("platform.templates");

  return (
    <RadioPrimitive.Root
      value={props.template.id}
      aria-label={t("useTemplate", { name: props.template.name })}
      className="group/template flex cursor-pointer flex-col overflow-hidden rounded-xl border text-left outline-none transition-colors hover:border-ring/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 data-checked:border-primary data-checked:ring-1 data-checked:ring-primary"
    >
      <div
        aria-hidden
        className="pointer-events-none relative aspect-square overflow-hidden border-b bg-muted/40 bg-[radial-gradient(color-mix(in_oklab,var(--color-foreground)_7%,transparent)_1px,transparent_1px)] bg-size-[0.625rem_0.625rem]"
      >
        <div className="absolute inset-x-2 top-2 overflow-hidden rounded-lg bg-white shadow-md ring-1 ring-black/5">
          <ResumeThumbnail
            resume={props.preview}
            template={props.template.id}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground px-3 py-2">
        <span className="line-clamp-2">
          {t(`descriptions.${props.template.id}`)}
        </span>
      </p>

      <p className="flex items-center gap-1.5 px-3 pb-2 pt-1 text-sm font-medium">
        {props.template.name}
        <CheckIcon className="ml-auto size-3.5 text-primary opacity-0 transition-opacity group-data-checked/template:opacity-100" />
      </p>
    </RadioPrimitive.Root>
  );
}
