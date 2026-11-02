import { buttonVariants } from "@lanjut/ui/components/button";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@lanjut/ui/components/sheet";
import { useIsMobile } from "@lanjut/ui/hooks/use-mobile";
import { cn } from "@lanjut/ui/lib/utils";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { ResumeDocument } from "@/components/editor/resume-document";
import type { ResumePreview } from "@/components/editor/resume-preview";
import type { GuideSampleTemplate } from "./guide-sample-types";

interface GuideTemplatePreviewProps {
  open: boolean;
  template: GuideSampleTemplate | undefined;
  preview: ResumePreview;
  templatesHref: string;
  useLabel: string;
  onClose: () => void;
}

/**
 * One template at full size: every page of the sample, with a link to pick
 * the template. A sheet from the right on wide screens, a drawer on phones.
 */
export function GuideTemplatePreview(props: GuideTemplatePreviewProps) {
  const isMobile = useIsMobile();
  const open = props.open;

  function onOpenChange(next: boolean) {
    if (!next) props.onClose();
  }

  if (isMobile) {
    return (
      <Drawer showSwipeHandle open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[calc(100dvh-3rem)]">
          {props.template && (
            <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_auto]">
              <DrawerHeader>
                <DrawerTitle>{props.template.name}</DrawerTitle>
                <DrawerDescription>
                  {props.template.description}
                </DrawerDescription>
              </DrawerHeader>
              <GuideTemplatePages {...props} template={props.template} />
              <DrawerFooter>
                <GuideTemplateUse {...props} template={props.template} />
              </DrawerFooter>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 data-[side=right]:sm:max-w-2xl">
        {props.template && (
          <div className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_auto]">
            <SheetHeader className="pr-12">
              <SheetTitle>{props.template.name}</SheetTitle>
              <SheetDescription>{props.template.description}</SheetDescription>
            </SheetHeader>
            <GuideTemplatePages {...props} template={props.template} />
            <SheetFooter>
              <GuideTemplateUse {...props} template={props.template} />
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

interface GuideTemplatePartProps {
  template: GuideSampleTemplate;
  preview: ResumePreview;
  templatesHref: string;
  useLabel: string;
}

function GuideTemplatePages(props: GuideTemplatePartProps) {
  return (
    <ScrollArea className="min-h-0 border-y bg-muted/50">
      <div inert className="p-4 sm:p-6" data-template={props.template.id}>
        <ResumeDocument resume={props.preview} template={props.template.id} />
      </div>
    </ScrollArea>
  );
}

function GuideTemplateUse(props: GuideTemplatePartProps) {
  return (
    <a
      href={`${props.templatesHref}?template=${props.template.id}`}
      className={cn(buttonVariants({ size: "lg" }), "h-11 gap-2")}
    >
      {props.useLabel}
      <ArrowRightIcon />
    </a>
  );
}
