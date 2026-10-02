import { useTranslations } from "use-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";

export function PlatformNavbarBreadcrumb() {
  const pathname = usePathname();
  const t = useTranslations("platform.breadcrumb");

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {pathname.endsWith("/platform") ? (
            <BreadcrumbPage>{t("platform")}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink render={<Link href="/platform" />}>
              {t("platform")}
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>

        {pathname.includes("/editor") && (
          <>
            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage>{t("editor")}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}

        {pathname.includes("/template") && (
          <>
            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage>{t("browseTemplates")}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
