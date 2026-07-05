"use client";

import { FilePlus, Inbox, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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

  // With unreadable documents present, "No résumés yet" would be a lie.
  if (indexStatus !== "ready" || index.length > 0 || unreadableCount > 0) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-16rem)] grid place-items-center">
      <Empty className="px-0">
        <EmptyContent>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Inbox />
            </EmptyMedia>

            <EmptyTitle>No résumés yet</EmptyTitle>
            <EmptyDescription>
              Nothing is saved on this device yet. Start from a template, or
              create a blank résumé.
            </EmptyDescription>

            <div className="inline-flex items-center gap-2">
              <Button
                nativeButton={false}
                render={<Link href="/platform/template" />}
              >
                <Search /> Browse templates
              </Button>
              <Button variant="secondary" onClick={() => setOpen(true)}>
                <FilePlus /> New résumé
              </Button>
            </div>
          </EmptyHeader>
        </EmptyContent>

        <PlatformResumeCreateDialog open={open} onOpenChange={setOpen} />
      </Empty>
    </div>
  );
}
