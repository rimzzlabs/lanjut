import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@lanjut/ui/components/alert-dialog";
import { Button } from "@lanjut/ui/components/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@lanjut/ui/components/drawer";
import { useIsMobile } from "@lanjut/ui/hooks/use-mobile";
import { useTranslations } from "use-intl";
import { useEditorId } from "@/hooks/use-editor-id";
import { useRouter } from "@/i18n/navigation";
import { EDITOR_PATHNAME } from "@/lib/routes";
import { deleteResumeWithUndo } from "./platform-resume-delete-undo";

interface PlatformResumeActionDeleteProps {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  resume: { id: string; title: string };
}

export function PlatformResumeActionDelete(
  props: PlatformResumeActionDeleteProps,
) {
  const isMobile = useIsMobile();
  const editorId = useEditorId();
  const router = useRouter();
  const t = useTranslations("forms.delete");
  const tc = useTranslations("forms.common");

  // The open résumé leaves the editor first, so the editor never shows a
  // document that is gone. Undo brings it back to the library.
  async function handleDelete() {
    props.onOpenChange(false);
    if (editorId === props.resume.id) await router.push(EDITOR_PATHNAME);
    void deleteResumeWithUndo(props.resume.id, {
      deleted: t("toast", { title: props.resume.title }),
      undo: tc("undo"),
    });
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
            <Button variant="destructive" onClick={() => void handleDelete()}>
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
            onClick={() => void handleDelete()}
          >
            {tc("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
