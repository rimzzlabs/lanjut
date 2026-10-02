import { useTranslations } from "use-intl";
import { PlatformShell } from "@/components/platform/platform-shell";
import { PlatformTemplateGrid } from "@/components/platform/platform-template-grid/platform-template-grid";
import { PlatformTemplateToolbar } from "@/components/platform/platform-template-toolbar";
import { AppProviders, type IslandProps } from "@/components/shared/providers";
import { TourAutostart } from "@/components/tour/tour-autostart";
import { TEMPLATE_TOUR } from "@/lib/tour";

export function PlatformTemplatePage(props: IslandProps) {
  return (
    <AppProviders locale={props.locale} pathname={props.pathname}>
      <PlatformShell>
        <PlatformTemplates />
      </PlatformShell>
    </AppProviders>
  );
}

function PlatformTemplates() {
  const t = useTranslations("platform.breadcrumb");

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <header className="border-b border-border pb-4">
        <h1 className="text-xl font-semibold tracking-tight">
          {t("browseTemplates")}
        </h1>
      </header>
      <PlatformTemplateToolbar />
      <PlatformTemplateGrid />
      <TourAutostart tour={TEMPLATE_TOUR} />
    </div>
  );
}
