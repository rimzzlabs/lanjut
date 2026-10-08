import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@lanjut/ui/components/drawer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@lanjut/ui/components/sheet";
import { Skeleton } from "@lanjut/ui/components/skeleton";
import { lazy, Suspense } from "react";
import { useTranslations } from "use-intl";
import { useAppFeedbackContext } from "@/hooks/use-feedback-context";
import { MEDIA_LG, useMediaQuery } from "@/hooks/use-media-query";
import { useFeedbackStore } from "@/lib/store";

/** The flow loads when feedback first opens, so the shell stays light. */
export function preloadFeedbackFlow() {
  return import("@/components/feedback/feedback-flow");
}

const FeedbackFlow = lazy(() =>
  preloadFeedbackFlow().then((module) => ({ default: module.FeedbackFlow })),
);

/**
 * The feedback flow in the app: a sheet from `lg`, a drawer below it.
 * Rendered once at the platform layout level, outside the sidebar: on mobile
 * the sidebar is a sheet that closes when this opens, and a sheet mounted
 * inside it would be unmounted mid-open. Opened through useFeedbackStore.
 */
export function PlatformFeedbackSheet() {
  const t = useTranslations("feedback");
  const wide = useMediaQuery(MEDIA_LG);
  const open = useFeedbackStore((state) => state.open);
  const setOpen = useFeedbackStore((state) => state.setOpen);

  if (wide) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-none lg:data-[side=right]:w-[min(40rem,94vw)]">
          <SheetHeader className="sr-only">
            <SheetTitle>{t("title")}</SheetTitle>
            <SheetDescription>{t("description")}</SheetDescription>
          </SheetHeader>
          <PlatformFeedbackContent onClose={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer showSwipeHandle open={open} onOpenChange={setOpen}>
      <DrawerContent className="h-[calc(100dvh-3rem)]">
        <DrawerHeader className="sr-only">
          <DrawerTitle>{t("title")}</DrawerTitle>
          <DrawerDescription>{t("description")}</DrawerDescription>
        </DrawerHeader>
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)]">
          <PlatformFeedbackContent onClose={() => setOpen(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function PlatformFeedbackContent(props: { onClose: () => void }) {
  const options = useFeedbackStore((state) => state.options);
  const context = useAppFeedbackContext();

  return (
    <Suspense fallback={<PlatformFeedbackFallback />}>
      <FeedbackFlow
        surface="sheet"
        kind={options.kind}
        area={options.area ?? context.area}
        details={context.details}
        onClose={props.onClose}
      />
    </Suspense>
  );
}

function PlatformFeedbackFallback() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="mt-4 h-18 w-full rounded-xl" />
      <Skeleton className="h-18 w-full rounded-xl" />
      <Skeleton className="h-18 w-full rounded-xl" />
    </div>
  );
}
