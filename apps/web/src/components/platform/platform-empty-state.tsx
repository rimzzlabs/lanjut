import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@lanjut/ui/components/empty";
import { cn } from "@lanjut/ui/lib/utils";
import { TrayIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { useProfileLabel } from "@/hooks/use-profile-label";
import { selectActiveProfile, useProfileStore } from "@/lib/store";
import { PlatformLibraryStart } from "./platform-library-start/platform-library-start";

/**
 * A library with nothing to show, then the ways to start. `device`: nothing
 * is saved at all. `profile`: other profiles hold résumés, this one none.
 * `unknown`: the résumés are not read yet. The message keeps its room and
 * stays unseen, because it cannot say yet that nothing is saved.
 */
export function PlatformEmptyState(props: {
  scope: "device" | "profile" | "unknown";
}) {
  const t = useTranslations("platform.emptyState");
  const profile = useProfileStore(selectActiveProfile);
  const label = useProfileLabel(profile);
  const forProfile = props.scope === "profile";
  const unknown = props.scope === "unknown";
  const title = forProfile ? t("profileTitle", { name: label }) : t("title");
  const description = t(forProfile ? "profileDescription" : "description");

  return (
    <div className="flex flex-col gap-10 pt-6 md:pt-10">
      <Empty
        className={cn("p-0", unknown && "invisible")}
        aria-hidden={unknown}
      >
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TrayIcon />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
      </Empty>

      <PlatformLibraryStart />
    </div>
  );
}
