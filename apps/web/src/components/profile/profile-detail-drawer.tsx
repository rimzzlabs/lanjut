import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@lanjut/ui/components/drawer";
import { ScrollArea } from "@lanjut/ui/components/scroll-area";
import { useTranslations } from "use-intl";
import { useProfileLabel } from "@/hooks/use-profile-label";
import { NEW_PROFILE } from "@/hooks/use-selected-profile";
import { selectProfile, useProfileStore } from "@/lib/store";
import { ProfileDetail } from "./profile-detail";

interface ProfileDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selection: string;
  onSelect: (id: string) => void;
}

/**
 * Below `lg`: one profile's information in a drawer. The scroll region is
 * the only row in flow (the title is screen-reader only), so it fills the
 * fixed height and scrolls.
 */
export function ProfileDetailDrawer(props: ProfileDetailDrawerProps) {
  return (
    <Drawer showSwipeHandle open={props.open} onOpenChange={props.onOpenChange}>
      <DrawerContent className="h-[calc(100dvh-3rem)]">
        <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)]">
          <ProfileDetailDrawerTitle selection={props.selection} />
          <ScrollArea className="min-h-0">
            <div className="p-4 pb-8">
              <ProfileDetail
                selection={props.selection}
                onSelect={props.onSelect}
                onCancelNew={() => props.onOpenChange(false)}
                framed={false}
              />
            </div>
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function ProfileDetailDrawerTitle(props: { selection: string }) {
  const t = useTranslations("profile");
  const profile = useProfileStore(selectProfile(props.selection));
  const label = useProfileLabel(profile);
  const isNew = props.selection === NEW_PROFILE;

  return (
    <DrawerHeader className="sr-only">
      <DrawerTitle>{isNew ? t("newTitle") : label}</DrawerTitle>
      <DrawerDescription>{t("profileDescription")}</DrawerDescription>
    </DrawerHeader>
  );
}
