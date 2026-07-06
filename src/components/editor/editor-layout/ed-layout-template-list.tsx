"use client";

import { useMemo } from "react";
import { RadioGroup } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { SEED_RESUME } from "@/lib/resume";
import { useResumeStore } from "@/lib/store";
import { resolveTemplateId, TEMPLATES } from "@/lib/templates";
import { buildResumeBlocks } from "../resume-blocks";
import { resumeToPreview } from "../resume-to-preview";
import { EditorLayoutTemplateItem } from "./ed-layout-template-item";

const SKELETONS = [1, 2, 3, 4, 5, 6];

const SEED_PREVIEW = resumeToPreview(SEED_RESUME);

/**
 * A document whose preview renders nothing beyond the header block would make
 * every template tile look identically blank, so fall back to the seed fixture
 * to keep the tiles comparable.
 */
function toTilePreview(preview: ReturnType<typeof resumeToPreview>) {
  return buildResumeBlocks(preview).length > 1 ? preview : SEED_PREVIEW;
}

export function EditorLayoutTemplateList() {
  const open = useResumeStore((state) => state.open);
  const updateOpen = useResumeStore((state) => state.updateOpen);

  const preview = useMemo(
    () => (open ? toTilePreview(resumeToPreview(open)) : null),
    [open],
  );

  if (!open || !preview) {
    return (
      <div className="grid grid-cols-2 gap-3 px-4">
        {SKELETONS.map((s) => (
          <Skeleton key={s} className="aspect-3/4 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <RadioGroup
      value={resolveTemplateId(open.templateId)}
      onValueChange={(value) => {
        updateOpen((draft) => {
          draft.templateId = value as string;
        });
      }}
      className="grid grid-cols-2 gap-3 px-4"
    >
      {TEMPLATES.map((template) => (
        <EditorLayoutTemplateItem
          key={template.id}
          template={template}
          preview={preview}
        />
      ))}
    </RadioGroup>
  );
}
