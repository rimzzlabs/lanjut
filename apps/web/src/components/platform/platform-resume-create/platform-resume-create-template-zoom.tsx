import { type TemplateId, templateNameOf } from "@lanjut/resume/templates";
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
import { ScrollArea } from "@lanjut/ui/components/scroll-area";
import { useTranslations } from "use-intl";
import { ResumeDocument } from "@/components/editor/resume-document";
import type { ResumePreview } from "@/components/editor/resume-preview";

interface PlatformResumeCreateTemplateZoomProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: TemplateId;
  preview: ResumePreview;
}

/**
 * Below `lg`: one template at full size, every page, in a drawer. The fixed
 * height gives the scroll region a definite track to scroll in.
 */
export function PlatformResumeCreateTemplateZoom(
  props: PlatformResumeCreateTemplateZoomProps,
) {
  const t = useTranslations();

  return (
    <Drawer showSwipeHandle open={props.open} onOpenChange={props.onOpenChange}>
      <DrawerContent className="h-[calc(100dvh-3rem)]">
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_auto]">
          <DrawerHeader className="pb-4">
            <DrawerTitle>{templateNameOf(props.template)}</DrawerTitle>
            <DrawerDescription>
              {t(`platform.templates.descriptions.${props.template}`)}
            </DrawerDescription>
          </DrawerHeader>

          <ScrollArea className="min-h-0 border-y bg-muted/50">
            <div className="p-4">
              <div inert data-template={props.template}>
                <ResumeDocument
                  resume={props.preview}
                  template={props.template}
                />
              </div>
            </div>
          </ScrollArea>

          <DrawerFooter className="pt-4">
            <DrawerClose render={<Button />}>{t("ui.done")}</DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
