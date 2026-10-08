import { S } from "@mobily/ts-belt";
import { useTranslations } from "use-intl";
import { useWorkspaceView } from "@/hooks/use-workspace-view";
import { Link, usePathname } from "@/i18n/navigation";
import { EDITOR_PATHNAME, TEMPLATE_PATHNAME } from "@/lib/routes";
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
  const view = useWorkspaceView();
  const t = useTranslations("platform.breadcrumb");
  const atTemplates = S.startsWith(pathname, TEMPLATE_PATHNAME);
  const atLibrary = !atTemplates && view !== "editor";

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {atLibrary && <BreadcrumbPage>{t("platform")}</BreadcrumbPage>}
          {!atLibrary && (
            <BreadcrumbLink render={<Link href={EDITOR_PATHNAME} />}>
              {t("platform")}
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>

        {view === "editor" && !atTemplates && (
          <>
            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage>{t("editor")}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}

        {atTemplates && (
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
