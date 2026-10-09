import type { Resume, ResumeIndexEntry } from "@lanjut/resume";
import type { TemplateSummary } from "@lanjut/resume/templates";
import { Button } from "@lanjut/ui/components/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@lanjut/ui/components/drawer";
import { ScrollArea } from "@lanjut/ui/components/scroll-area";
import { XIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import type { ResumePreview } from "@/components/editor/resume-preview";
import { PlatformTemplatePreview } from "./platform-template-preview/platform-template-preview";

interface PlatformTemplateDrawerProps {
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
 * Below `lg`: one template's preview in a drawer that rises to near the top
 * of the screen. The bar with the actions stays at the top while the pages
 * scroll. The grid track gives the scroll region a definite height.
 */
export function PlatformTemplateDrawer(props: PlatformTemplateDrawerProps) {
  const t = useTranslations("ui");

  return (
    <Drawer showSwipeHandle open={props.open} onOpenChange={props.onOpenChange}>
      <DrawerContent className="h-[calc(100dvh-3rem)]">
        <DrawerTitle className="sr-only">{props.template.name}</DrawerTitle>
        <DrawerDescription className="sr-only">
          {props.template.description}
        </DrawerDescription>

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)]">
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
                <DrawerClose
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
                </DrawerClose>
              }
            />
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
