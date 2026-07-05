"use client";

import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
} from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";

const MobileContext = createContext(false);

interface SectionProps {
  className?: string;
  children?: ReactNode;
}

export function ResponsiveDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileContext.Provider value={isMobile}>
        <Drawer
          showSwipeHandle
          open={props.open}
          onOpenChange={props.onOpenChange}
        >
          {props.children}
        </Drawer>
      </MobileContext.Provider>
    );
  }

  return (
    <MobileContext.Provider value={isMobile}>
      <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        {props.children}
      </Dialog>
    </MobileContext.Provider>
  );
}

export function ResponsiveDialogContent(props: {
  className?: string;
  children?: ReactNode;
  showCloseButton?: boolean;
}) {
  const isMobile = useContext(MobileContext);

  if (isMobile) {
    return (
      <DrawerContent>
        <div className="overflow-y-auto px-4 pb-4">{props.children}</div>
      </DrawerContent>
    );
  }

  return (
    <DialogContent
      className={props.className}
      showCloseButton={props.showCloseButton}
    >
      {props.children}
    </DialogContent>
  );
}

export function ResponsiveDialogHeader(props: SectionProps) {
  const isMobile = useContext(MobileContext);

  if (isMobile) {
    return (
      <DrawerHeader className={cn("px-0", props.className)}>
        {props.children}
      </DrawerHeader>
    );
  }

  return <DialogHeader {...props} />;
}

export function ResponsiveDialogTitle(props: SectionProps) {
  const isMobile = useContext(MobileContext);
  const Title = isMobile ? DrawerTitle : DialogTitle;
  return <Title {...props} />;
}

export function ResponsiveDialogDescription(props: SectionProps) {
  const isMobile = useContext(MobileContext);
  const Description = isMobile ? DrawerDescription : DialogDescription;
  return <Description {...props} />;
}

export function ResponsiveDialogFooter(props: SectionProps) {
  const isMobile = useContext(MobileContext);

  if (isMobile) {
    return (
      <DrawerFooter className={cn("px-0 pb-0", props.className)}>
        {props.children}
      </DrawerFooter>
    );
  }

  return <DialogFooter {...props} />;
}

export function ResponsiveDialogClose({
  children,
  ...buttonProps
}: ComponentProps<typeof Button>) {
  const isMobile = useContext(MobileContext);

  if (isMobile) {
    return (
      <DrawerClose render={<Button {...buttonProps} />}>{children}</DrawerClose>
    );
  }

  return (
    <DialogClose render={<Button {...buttonProps} />}>{children}</DialogClose>
  );
}
