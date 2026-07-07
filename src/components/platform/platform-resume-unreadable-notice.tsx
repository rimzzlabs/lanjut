"use client";

import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useResumeStore } from "@/lib/store";

export function PlatformResumeUnreadableNotice() {
  const unreadableCount = useResumeStore((state) => state.unreadableCount);
  const t = useTranslations("platform.unreadable");

  if (unreadableCount === 0) return null;

  return (
    <Alert>
      <TriangleAlert />
      <AlertTitle>{t("title")}</AlertTitle>
      <AlertDescription>
        {t("description", { count: unreadableCount })}
      </AlertDescription>
    </Alert>
  );
}
