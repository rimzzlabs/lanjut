import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Separator } from "../ui/separator";
import { SidebarHeader, SidebarTrigger } from "../ui/sidebar";

export function PlatformSidebarHeader() {
  const t = useTranslations("platform.sidebar");

  return (
    <SidebarHeader>
      <div className="flex items-center gap-2">
        <SidebarTrigger className="lg:hidden" />

        <Separator orientation="vertical" className="lg:hidden" />

        <Link
          href="/"
          aria-label={t("home")}
          className="flex items-center gap-2"
        >
          <Image
            src="/favicon-512x512.png"
            alt={t("logoAlt")}
            width={280}
            height={68}
            className="size-7"
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Lanjut</span>
            <span className="text-xs text-muted-foreground">
              <span className="sr-only">{t("localFirst")}</span> {t("tagline")}
            </span>
          </div>
        </Link>
      </div>
    </SidebarHeader>
  );
}
