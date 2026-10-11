import { Button } from "@lanjut/ui/components/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@lanjut/ui/components/drawer";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@lanjut/ui/components/empty";
import { Spinner } from "@lanjut/ui/components/spinner";
import { useIsMobile } from "@lanjut/ui/hooks/use-mobile";
import { cn } from "@lanjut/ui/lib/utils";
import { BrowsersIcon, CursorClickIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useTranslations } from "use-intl";
import type { EditKind } from "@/lib/window-channel";

interface EditLockFrameProps {
  item: EditKind;
  /** Another window edits the item. */
  frozen: boolean;
  /** This window asked to edit and waits for the lock. */
  taking: boolean;
  onTakeOver: () => void;
  /** Centers the notice in a frame of fixed height. A tall frame keeps it at the top. */
  centered?: boolean;
  className?: string;
  children: ReactNode;
}

interface EditLockNoticeProps {
  item: EditKind;
  taking: boolean;
  onTakeOver: () => void;
}

// Above the editor's floating Edit button (z-40, earlier in the page), so the
// button never shows through the scrim.
const SCRIM =
  "absolute inset-0 z-40 flex justify-center bg-background/70 p-6 backdrop-blur-xs";

/**
 * Wraps a résumé or a profile that one window edits at a time. While another
 * window edits it, the content stays as it was, inert, under a scrim, with a
 * notice that offers to edit here: a card on a wide screen, a drawer on a
 * phone.
 */
export function EditLockFrame(props: EditLockFrameProps) {
  // Read here, not in the notice: the frame is mounted before it freezes, so
  // the notice knows its form on its first paint.
  const isMobile = useIsMobile();

  return (
    <div className={cn("relative", props.className)}>
      <div inert={props.frozen} className="contents">
        {props.children}
      </div>
      {props.frozen && !isMobile && (
        <div
          className={cn(SCRIM, props.centered ? "items-center" : "items-start")}
        >
          <EditLockCard {...props} />
        </div>
      )}
      {props.frozen && isMobile && (
        <>
          <div className={SCRIM} />
          <EditLockDrawer {...props} />
        </>
      )}
    </div>
  );
}

function EditLockCard(props: EditLockNoticeProps) {
  const t = useTranslations("conflict");

  return (
    <Empty className="sticky top-6 w-full max-w-md flex-none rounded-xl border border-solid bg-card p-8 shadow-lg">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BrowsersIcon />
        </EmptyMedia>
        <EmptyTitle>{t("frozenTitle", { item: props.item })}</EmptyTitle>
        <EmptyDescription>{t("frozenDescription")}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <EditLockButton taking={props.taking} onTakeOver={props.onTakeOver} />
      </EmptyContent>
    </Empty>
  );
}

/**
 * The notice on a phone. It is not modal and has no way to close: the rest of
 * the app stays usable, and it leaves only with "Edit here" or with the view.
 */
function EditLockDrawer(props: EditLockNoticeProps) {
  const t = useTranslations("conflict");

  return (
    <Drawer open modal={false} disablePointerDismissal>
      <DrawerContent>
        <DrawerHeader className="items-center gap-2 pt-6">
          <EmptyMedia variant="icon">
            <BrowsersIcon />
          </EmptyMedia>
          <DrawerTitle className="text-lg">
            {t("frozenTitle", { item: props.item })}
          </DrawerTitle>
          <DrawerDescription>{t("frozenDescription")}</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="pt-4">
          <EditLockButton
            size="lg"
            taking={props.taking}
            onTakeOver={props.onTakeOver}
          />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function EditLockButton(props: {
  taking: boolean;
  onTakeOver: () => void;
  size?: "default" | "lg";
}) {
  const t = useTranslations("conflict");

  return (
    <Button
      size={props.size}
      disabled={props.taking}
      onClick={props.onTakeOver}
    >
      {props.taking ? <Spinner /> : <CursorClickIcon />}
      {t("editHere")}
    </Button>
  );
}
