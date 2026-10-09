import { Button } from "@lanjut/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@lanjut/ui/components/empty";
import { FilePlusIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useTranslations } from "use-intl";
import { PlatformResumeCreateSheet } from "../platform-resume-create/platform-resume-create-sheet";

interface PlatformResumeGridEmptySearchProps {
  query: string;
}

export function PlatformResumeGridEmptySearch(
  props: PlatformResumeGridEmptySearchProps,
) {
  const { query } = props;
  const [open, setOpen] = useState(false);
  const t = useTranslations("platform.grid");

  return (
    <Empty className="border border-dashed">
      <EmptyHeader className="max-w-full">
        <EmptyMedia variant="icon">
          <MagnifyingGlassIcon />
        </EmptyMedia>

        <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
        <EmptyDescription className="mx-auto max-w-xl truncate">
          &ldquo;{query}&rdquo;
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        <Button onClick={() => setOpen(true)} className="mx-auto max-w-60">
          <FilePlusIcon className="shrink-0" />
          <span className="min-w-0 truncate">{t("create", { query })}</span>
        </Button>
      </EmptyContent>

      <PlatformResumeCreateSheet
        key={query}
        initialTitle={query}
        open={open}
        onOpenChange={setOpen}
      />
    </Empty>
  );
}
