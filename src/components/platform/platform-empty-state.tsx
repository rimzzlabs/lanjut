import { A } from "@mobily/ts-belt";
import {
  FilePlusIcon,
  MagnifyingGlassIcon,
  TrayIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { useTranslations } from "use-intl";
import { Link } from "@/i18n/navigation";
import { useResumeStore } from "@/lib/store";
import { Button } from "../ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import { PlatformResumeCreateDialog } from "./platform-resume-create-dialog";

export function PlatformEmptyState() {
  const index = useResumeStore((state) => state.index);
  const indexStatus = useResumeStore((state) => state.indexStatus);
  const unreadableCount = useResumeStore((state) => state.unreadableCount);
  const [open, setOpen] = useState(false);
  const t = useTranslations("platform.emptyState");

  // With unreadable documents present, "No résumés yet" would be a lie.
  if (indexStatus !== "ready" || A.isNotEmpty(index) || unreadableCount > 0) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-16rem)] grid place-items-center">
      <Empty className="px-0">
        <EmptyContent>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TrayIcon />
            </EmptyMedia>

            <EmptyTitle>{t("title")}</EmptyTitle>
            <EmptyDescription>{t("description")}</EmptyDescription>

            <div className="inline-flex items-center gap-2">
              <Button
                nativeButton={false}
                render={<Link href="/platform/template" />}
              >
                <MagnifyingGlassIcon /> {t("browseTemplates")}
              </Button>
              <Button variant="secondary" onClick={() => setOpen(true)}>
                <FilePlusIcon /> {t("newResume")}
              </Button>
            </div>
          </EmptyHeader>
        </EmptyContent>

        <PlatformResumeCreateDialog open={open} onOpenChange={setOpen} />
      </Empty>
    </div>
  );
}
