"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("forms.delete");
  const tc = useTranslations("forms.common");

  async function handleDelete() {
    setPending(true);
    await removeResume(props.resume.id);
    setPending(false);
    props.onOpenChange(false);
  }

  const bold = (chunks: React.ReactNode) => <strong>{chunks}</strong>;
  const title = t.rich("title", { title: props.resume.title, b: bold });
  const description = t.rich("description", {
    title: props.resume.title,
    b: bold,
  });

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
              {tc("delete")}
            </Button>
            <DrawerClose render={<Button variant="outline" />}>
              {tc("cancel")}
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
          <AlertDialogCancel>{tc("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={pending}
          >
            {tc("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
