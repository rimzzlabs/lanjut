"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TemplateSummary } from "@/lib/templates";
import { PlatformResumeCreateDialog } from "../platform-resume-create-dialog";

interface PlatformTemplateGridItemProps {
  template: TemplateSummary;
}

export function PlatformTemplateGridItem({
  template,
}: PlatformTemplateGridItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="truncate">{template.name}</CardTitle>
        <CardDescription className="line-clamp-3 text-xs">
          {template.description}
        </CardDescription>
      </CardHeader>

      <CardFooter className="mt-auto justify-end">
        <Button size="sm" onClick={() => setOpen(true)}>
          Use template
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
