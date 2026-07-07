"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ResumeThumbnail } from "@/components/editor/resume-thumbnail";
import { resumeToPreview } from "@/components/editor/resume-to-preview";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SEED_RESUME } from "@/lib/resume";
import type { TemplateSummary } from "@/lib/templates";
import { PlatformPaperFrame } from "../platform-paper-frame";
import { PlatformResumeCreateDialog } from "../platform-resume-create-dialog";

const SEED_PREVIEW = resumeToPreview(SEED_RESUME);

interface PlatformTemplateGridItemProps {
  template: TemplateSummary;
}

export function PlatformTemplateGridItem({
  template,
}: PlatformTemplateGridItemProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("platform.templates");

  return (
    <Card size="sm" className="pt-0">
      <div className="relative">
        <PlatformPaperFrame>
          <ResumeThumbnail resume={SEED_PREVIEW} template={template.id} />
        </PlatformPaperFrame>
        <button
          type="button"
          aria-label={t("use", { name: template.name })}
          onClick={() => setOpen(true)}
          className="absolute inset-0 cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        />
      </div>

      <CardHeader>
        <CardTitle className="truncate">{template.name}</CardTitle>
        <CardDescription className="line-clamp-3 text-xs">
          {template.description}
        </CardDescription>
      </CardHeader>

      <CardFooter className="mt-auto">
        <Button size="lg" className="w-full" onClick={() => setOpen(true)}>
          {t("use", { name: template.name })}
        </Button>
      </CardFooter>

      <PlatformResumeCreateDialog
        open={open}
        onOpenChange={setOpen}
        templateId={template.id}
      />
    </Card>
  );
}
