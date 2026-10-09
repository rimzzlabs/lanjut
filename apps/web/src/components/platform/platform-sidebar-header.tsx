import { Separator } from "@lanjut/ui/components/separator";
import { SidebarHeader, SidebarTrigger } from "@lanjut/ui/components/sidebar";
import { useTranslations } from "use-intl";
import { Link } from "@/i18n/navigation";
import { homeHref } from "@/lib/routes";

export function PlatformSidebarHeader() {
  const t = useTranslations("platform.sidebar");

  return (
    <SidebarHeader>
      <div className="flex items-center gap-2">
        <SidebarTrigger className="lg:hidden group-data-[collapsible=icon]:hidden" />

        <Separator
          orientation="vertical"
          className="lg:hidden group-data-[collapsible=icon]:hidden"
        />

        <Link
          href={homeHref()}
          className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:p-0.5"
        >
          <img
            src="/favicon.svg"
            alt=""
            width={28}
            height={28}
            className="size-7 shrink-0"
          />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-brand text-sm font-bold">Lanjut</span>
            <span className="text-xs text-muted-foreground">
              <span className="sr-only">{t("localFirst")}</span> {t("tagline")}
            </span>
          </div>
        </Link>
      </div>
    </SidebarHeader>
  );
}
