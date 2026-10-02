import { S } from "@mobily/ts-belt";
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
  const atPlatform = S.endsWith(pathname, "/platform");

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {atPlatform && <BreadcrumbPage>{t("platform")}</BreadcrumbPage>}
          {!atPlatform && (
            <BreadcrumbLink render={<Link href="/platform" />}>
              {t("platform")}
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>

        {S.includes(pathname, "/editor") && (
          <>
            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage>{t("editor")}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}

        {S.includes(pathname, "/template") && (
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
