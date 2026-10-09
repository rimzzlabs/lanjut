import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@lanjut/ui/components/breadcrumb";
import { S } from "@mobily/ts-belt";
import { useTranslations } from "use-intl";
import { useWorkspaceView } from "@/hooks/use-workspace-view";
import { Link, usePathname } from "@/i18n/navigation";
import {
  CHANGELOG_PATHNAME,
  EDITOR_PATHNAME,
  PROFILE_PATHNAME,
  TEMPLATE_PATHNAME,
} from "@/lib/routes";

export function PlatformNavbarBreadcrumb() {
  const pathname = usePathname();
  const view = useWorkspaceView();
  const t = useTranslations("platform.breadcrumb");
  const tp = useTranslations("profile");
  const atTemplates = S.startsWith(pathname, TEMPLATE_PATHNAME);
  const atProfiles = S.startsWith(pathname, PROFILE_PATHNAME);
  const atChangelog = S.startsWith(pathname, CHANGELOG_PATHNAME);
  const atLibrary =
    !atTemplates && !atProfiles && !atChangelog && view !== "editor";

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

        {atProfiles && (
          <>
            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage>{tp("profiles")}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}

        {atChangelog && (
          <>
            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage>{t("changelog")}</BreadcrumbPage>
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
