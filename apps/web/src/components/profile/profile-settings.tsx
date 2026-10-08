import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@lanjut/ui/components/drawer";
import { ScrollArea } from "@lanjut/ui/components/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@lanjut/ui/components/sheet";
import { useTranslations } from "use-intl";
import { SegmentedControl } from "@/components/shared/segmented-control";
import { MEDIA_LG, useMediaQuery } from "@/hooks/use-media-query";
import {
  type ProfileSettingsSection,
  useProfileSettingsStore,
} from "@/lib/store";
import { ProfileSettingsBody } from "./profile-settings-body";
import { ProfileSettingsNav } from "./profile-settings-nav";

/**
 * Profile settings, preferences, and a new profile in one surface. From `lg`
 * it is a wide sheet with the sections in a side column. Below `lg` it is a
 * drawer with the sections in a switch at the top.
 */
export function ProfileSettings() {
  const t = useTranslations("profile");
  const wide = useMediaQuery(MEDIA_LG);
  const open = useProfileSettingsStore((state) => state.open);
  const section = useProfileSettingsStore((state) => state.section);
  const setOpen = useProfileSettingsStore((state) => state.setOpen);

  if (wide) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-none lg:data-[side=right]:w-[min(56rem,94vw)]">
          <SheetHeader className="sr-only">
            <SheetTitle>{t("settings")}</SheetTitle>
            <SheetDescription>{t("settingsDescription")}</SheetDescription>
          </SheetHeader>
          <div className="grid min-h-0 flex-1 grid-cols-[15rem_minmax(0,1fr)] grid-rows-[minmax(0,1fr)]">
            <ProfileSettingsNav />
            <ScrollArea className="min-h-0">
              <div className="mx-auto max-w-2xl p-8 pt-12">
                <ProfileSettingsBody section={section} />
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer showSwipeHandle open={open} onOpenChange={setOpen}>
      <DrawerContent className="h-[calc(100dvh-3rem)]">
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)]">
          <DrawerHeader className="items-center gap-3 border-b pb-4">
            <DrawerTitle className="sr-only">{t("settings")}</DrawerTitle>
            <DrawerDescription className="sr-only">
              {t("settingsDescription")}
            </DrawerDescription>
            <ProfileSettingsSwitch section={section} />
          </DrawerHeader>
          <ScrollArea className="min-h-0">
            <div className="p-4 pb-8">
              <ProfileSettingsBody section={section} />
            </div>
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function ProfileSettingsSwitch(props: { section: ProfileSettingsSection }) {
  const t = useTranslations("profile");
  const openAt = useProfileSettingsStore((state) => state.openAt);

  return (
    <SegmentedControl
      aria-label={t("settings")}
      value={props.section}
      onValueChange={(value) => openAt(value as ProfileSettingsSection)}
      items={[
        { value: "profile", label: t("profileSection") },
        { value: "preferences", label: t("preferences") },
        { value: "new", label: t("newShort") },
      ]}
    />
  );
}
