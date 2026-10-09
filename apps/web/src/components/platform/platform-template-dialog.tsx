import type { Resume, ResumeIndexEntry } from "@lanjut/resume";
import type { TemplateSummary } from "@lanjut/resume/templates";
import { Button } from "@lanjut/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@lanjut/ui/components/dialog";
import { ScrollArea } from "@lanjut/ui/components/scroll-area";
import { XIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import type { ResumePreview } from "@/components/editor/resume-preview";
import { PlatformTemplatePreview } from "./platform-template-preview/platform-template-preview";

interface PlatformTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: TemplateSummary;
  preview: ResumePreview | null;
  source: string;
  onSourceChange: (source: string) => void;
  resumes: readonly ResumeIndexEntry[];
  target: ResumeIndexEntry | undefined;
  document: Resume | null;
}

/**
 * Below `lg`: one template's preview in a dialog that nearly fills the
 * screen. The bar with the actions stays at the top while the pages scroll.
 */
export function PlatformTemplateDialog(props: PlatformTemplateDialogProps) {
  const t = useTranslations("ui");

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="grid h-[calc(100svh-2rem)] grid-rows-[minmax(0,1fr)] gap-0 overflow-hidden p-0 sm:max-w-2xl"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{props.template.name}</DialogTitle>
          <DialogDescription>{props.template.description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="min-h-0">
          <PlatformTemplatePreview
            variant="plain"
            template={props.template}
            preview={props.preview}
            source={props.source}
            onSourceChange={props.onSourceChange}
            resumes={props.resumes}
            target={props.target}
            document={props.document}
            headerEnd={
              <DialogClose
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-3 right-3"
                  />
                }
              >
                <XIcon />
                <span className="sr-only">{t("close")}</span>
              </DialogClose>
            }
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
