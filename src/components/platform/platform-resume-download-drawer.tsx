"use client";

import { useTranslations } from "next-intl";
import { useResumeDownload } from "@/hooks/use-resume-download";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { PlatformResumeDownloadForm } from "./platform-resume-download-form";

export function PlatformResumeDownloadDrawer(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { resume, generating, download } = useResumeDownload();
  const t = useTranslations("forms.download");

  return (
    <Drawer showSwipeHandle open={props.open} onOpenChange={props.onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("drawerTitle")}</DrawerTitle>
          <DrawerDescription>{t("drawerDescription")}</DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-6">
          <PlatformResumeDownloadForm
            key={`${resume?.id}-${props.open}`}
            defaultFileName={resume?.title ?? ""}
            generating={generating}
            onSubmit={(format, fileName) =>
              void download(format, fileName).then(
                (done) => done && props.onOpenChange(false),
              )
            }
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
