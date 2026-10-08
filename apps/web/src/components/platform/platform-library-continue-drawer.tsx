import type { Resume, ResumeIndexEntry } from "@lanjut/resume";
import { resolveTemplateId } from "@lanjut/resume/templates";
import { Button } from "@lanjut/ui/components/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@lanjut/ui/components/drawer";
import { ScrollArea } from "@lanjut/ui/components/scroll-area";
import {
  ArrowRightIcon,
  CopyIcon,
  DownloadSimpleIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useMemo } from "react";
import { useTranslations } from "use-intl";
import { EditorPreviewSkeleton } from "@/components/editor/editor-preview-skeleton";
import { ResumeDocument } from "@/components/editor/resume-document";
import { resumeToPreview } from "@/components/editor/resume-to-preview";
import { Link } from "@/i18n/navigation";
import { editorHref } from "@/lib/routes";
import { useResumeStore } from "@/lib/store";
import { PlatformResumeMeta } from "./platform-resume-meta";

export type ContinueAction = "download" | "rename" | "delete";

interface PlatformLibraryContinueDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resume: ResumeIndexEntry;
  document: Resume | null;
  /** The drawer closes first, then the action's own dialog opens. */
  onAction: (action: ContinueAction) => void;
}

/**
 * On a phone: every page of the résumé edited last, with the way into the
 * editor and the actions a card menu holds elsewhere.
 */
export function PlatformLibraryContinueDrawer(
  props: PlatformLibraryContinueDrawerProps,
) {
  const t = useTranslations("platform");
  const duplicateResume = useResumeStore((state) => state.duplicateResume);
  const preview = useMemo(
    () => (props.document ? resumeToPreview(props.document) : null),
    [props.document],
  );
  const template = resolveTemplateId(props.document?.templateId ?? "");

  return (
    <Drawer showSwipeHandle open={props.open} onOpenChange={props.onOpenChange}>
      <DrawerContent className="h-[calc(100dvh-3rem)]">
        <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)_auto]">
          <DrawerHeader className="pb-4">
            <DrawerTitle className="truncate">{props.resume.title}</DrawerTitle>
            <DrawerDescription render={<div />}>
              <PlatformResumeMeta
                resume={props.resume}
                document={props.document}
                className="justify-center md:justify-start"
              />
            </DrawerDescription>
          </DrawerHeader>

          <ScrollArea className="min-h-0 border-y bg-muted/50">
            <div className="p-4">
              {preview && (
                <div inert data-template={template}>
                  <ResumeDocument resume={preview} template={template} />
                </div>
              )}
              {!preview && <EditorPreviewSkeleton />}
            </div>
          </ScrollArea>

          <DrawerFooter className="pt-4">
            <Button
              nativeButton={false}
              render={<Link href={editorHref(props.resume.id)} />}
            >
              {t("library.openEditor")}
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => props.onAction("download")}
              >
                <DownloadSimpleIcon data-icon="inline-start" />
                {t("grid.download")}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  props.onOpenChange(false);
                  void duplicateResume(
                    props.resume.id,
                    t("grid.copyOf", { title: props.resume.title }),
                  );
                }}
              >
                <CopyIcon data-icon="inline-start" />
                {t("grid.duplicate")}
              </Button>
              <Button
                variant="outline"
                onClick={() => props.onAction("rename")}
              >
                <PencilSimpleIcon data-icon="inline-start" />
                {t("grid.rename")}
              </Button>
              <Button
                variant="outline"
                className="text-destructive"
                onClick={() => props.onAction("delete")}
              >
                <TrashIcon data-icon="inline-start" />
                {t("grid.delete")}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
