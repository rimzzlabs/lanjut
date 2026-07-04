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
  const [open, setOpen] = useState(false);

  if (indexStatus !== "ready" || index.length > 0) return null;

  return (
    <Empty>
      <EmptyContent>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Inbox />
          </EmptyMedia>

          <EmptyTitle>No Résumé Yet</EmptyTitle>
          <EmptyDescription>
            You have not yet create a résumé on this device. You can create a
            new résumé from scratch or from sample below.
          </EmptyDescription>

          <div className="inline-flex items-center gap-2">
            <Button
              nativeButton={false}
              render={<Link href="/platform/template" />}
            >
              <Search /> Browse Template
            </Button>
            <Button variant="secondary" onClick={() => setOpen(true)}>
              <FilePlus /> New Résumé
            </Button>
          </div>
        </EmptyHeader>
      </EmptyContent>

      <PlatformResumeCreateDialog open={open} onOpenChange={setOpen} />
    </Empty>
  );
}
