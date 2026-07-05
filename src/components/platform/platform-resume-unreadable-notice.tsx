"use client";

import { TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useResumeStore } from "@/lib/store";

export function PlatformResumeUnreadableNotice() {
  const unreadableCount = useResumeStore((state) => state.unreadableCount);

  if (unreadableCount === 0) return null;

  const subject =
    unreadableCount === 1 ? "1 résumé was" : `${unreadableCount} résumés were`;

  return (
    <Alert>
      <TriangleAlert />
      <AlertTitle>Some résumés need a newer version of the app</AlertTitle>
      <AlertDescription>
        {subject} saved by a newer version of Lanjut than the one this tab is
        running. They are still stored safely on this device. Refresh the page
        to update the app and see them again.
      </AlertDescription>
    </Alert>
  );
}
