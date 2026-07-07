"use client";

import { FilePlus2, SearchX } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { PlatformResumeCreateDialog } from "../platform-resume-create-dialog";

interface PlatformResumeGridEmptySearchProps {
  query: string;
}

export function PlatformResumeGridEmptySearch({
  query,
}: PlatformResumeGridEmptySearchProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("platform.grid");

  return (
    <Empty className="border border-dashed">
      <EmptyHeader className="max-w-full">
        <EmptyMedia variant="icon">
          <SearchX />
        </EmptyMedia>

        <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
        <EmptyDescription className="mx-auto max-w-xl truncate">
          &ldquo;{query}&rdquo;
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        <Button onClick={() => setOpen(true)} className="mx-auto max-w-60">
          <FilePlus2 className="shrink-0" />
          <span className="min-w-0 truncate">{t("create", { query })}</span>
        </Button>
      </EmptyContent>

      <PlatformResumeCreateDialog
        key={query}
        initialTitle={query}
        open={open}
        onOpenChange={setOpen}
      />
    </Empty>
  );
}
