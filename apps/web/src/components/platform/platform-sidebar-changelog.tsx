import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@lanjut/ui/components/sidebar";
import { S } from "@mobily/ts-belt";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LATEST_CHANGELOG_VERSION } from "@/lib/changelog";
import { CHANGELOG_PATHNAME } from "@/lib/routes";
import { useChangelogStore } from "@/lib/store";

/** The link to the changelog, with a dot until the latest release is read. */
export function PlatformSidebarChangelog() {
  const t = useTranslations("platform.sidebar");
  const pathname = usePathname();
  const lastSeenVersion = useChangelogStore((state) => state.lastSeenVersion);
  const hasUnseen = lastSeenVersion !== LATEST_CHANGELOG_VERSION;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={S.startsWith(pathname, CHANGELOG_PATHNAME)}
        tooltip={t("changelog")}
        render={<Link href={CHANGELOG_PATHNAME} />}
      >
        <ClockCounterClockwiseIcon /> {t("changelog")}
        {hasUnseen && (
          <>
            <span className="sr-only">, {t("changelogUnseen")}</span>
            <span
              aria-hidden
              className="ml-auto size-2 shrink-0 animate-pulse rounded-full bg-primary motion-reduce:animate-none group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:top-1 group-data-[collapsible=icon]:right-1"
            />
          </>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
