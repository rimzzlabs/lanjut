"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useResumeStore } from "@/lib/store";

interface PlatformResumeActionDeleteProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  resume: { id: string; title: string };
}

export function PlatformResumeActionDelete(
  props: PlatformResumeActionDeleteProps,
) {
  const removeResume = useResumeStore((state) => state.removeResume);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    await removeResume(props.resume.id);
    setPending(false);
    props.onOpenChange(false);
  }

  return (
    <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete <strong>{props.resume.title}</strong>?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will delete <strong>{props.resume.title}</strong>.{" "}
            <strong>This action cannot be undone</strong>. Are you sure?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={pending}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
