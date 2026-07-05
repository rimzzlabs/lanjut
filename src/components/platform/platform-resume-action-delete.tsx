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
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useResumeStore } from "@/lib/store";

interface PlatformResumeActionDeleteProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  resume: { id: string; title: string };
}

export function PlatformResumeActionDelete(
  props: PlatformResumeActionDeleteProps,
) {
  const isMobile = useIsMobile();
  const removeResume = useResumeStore((state) => state.removeResume);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    await removeResume(props.resume.id);
    setPending(false);
    props.onOpenChange(false);
  }

  const title = (
    <>
      Delete <strong>{props.resume.title}</strong>?
    </>
  );
  const description = (
    <>
      This will delete <strong>{props.resume.title}</strong>.{" "}
      <strong>This action cannot be undone</strong>. Are you sure?
    </>
  );

  if (isMobile) {
    return (
      <Drawer
        showSwipeHandle
        open={props.open}
        onOpenChange={props.onOpenChange}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>

          <DrawerFooter>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={pending}
            >
              Delete
            </Button>
            <DrawerClose render={<Button variant="outline" />}>
              Cancel
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
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
