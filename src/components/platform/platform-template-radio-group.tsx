"use client";

import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { CheckIcon } from "lucide-react";
import { motion } from "motion/react";
import { ResumeThumbnail } from "@/components/editor/resume-thumbnail";
import { resumeToPreview } from "@/components/editor/resume-to-preview";
import { RadioGroup } from "@/components/ui/radio-group";
import { SEED_RESUME } from "@/lib/resume";
import { TEMPLATES, type TemplateId } from "@/lib/templates";

const SEED_PREVIEW = resumeToPreview(SEED_RESUME);

interface PlatformTemplateRadioGroupProps {
  value: TemplateId;
  onValueChange: (next: TemplateId) => void;
}

/**
 * Template chooser: a radio list of template names beside one live seed-data
 * preview of the selected template. A single legible preview beats a tile per
 * template — at dialog size six mini-renders are unreadable.
 */
export function PlatformTemplateRadioGroup(
  props: PlatformTemplateRadioGroupProps,
) {
  return (
    <div className="grid grid-cols-[1fr_11rem] gap-3">
      <RadioGroup
        value={props.value}
        onValueChange={(value) => props.onValueChange(value as TemplateId)}
        className="flex flex-col gap-0"
      >
        {TEMPLATES.map((template) => (
          <RadioPrimitive.Root
            key={template.id}
            value={template.id}
            className="group/option flex cursor-pointer items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-left text-sm outline-none transition-colors hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 data-checked:border-border data-checked:bg-accent data-checked:font-medium"
          >
            {template.name}
            <CheckIcon className="ml-auto size-3.5 text-primary opacity-0 transition-opacity group-data-checked/option:opacity-100" />
          </RadioPrimitive.Root>
        ))}
      </RadioGroup>

      <div
        aria-hidden
        className="pointer-events-none relative overflow-hidden rounded-xl border bg-muted/40 bg-[radial-gradient(color-mix(in_oklab,var(--color-foreground)_7%,transparent)_1px,transparent_1px)] bg-size-[0.625rem_0.625rem]"
      >
        <motion.div
          key={props.value}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="absolute inset-x-4 top-4 overflow-hidden rounded-xs bg-white shadow-md ring-1 ring-black/5"
        >
          <ResumeThumbnail resume={SEED_PREVIEW} template={props.value} />
        </motion.div>
      </div>
    </div>
  );
}
