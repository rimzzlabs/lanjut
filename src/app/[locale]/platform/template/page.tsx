import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { PlatformTemplateGrid } from "@/components/platform/platform-template-grid/platform-template-grid";
import { PlatformTemplateToolbar } from "@/components/platform/platform-template-toolbar";
import { TourAutostart } from "@/components/tour/tour-autostart";
import { TEMPLATE_TOUR } from "@/lib/tour";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "platform.breadcrumb" });
  return { title: t("browseTemplates") };
}

export default function PlatformTemplatePage() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Suspense>
        <PlatformTemplateToolbar />
        <PlatformTemplateGrid />
      </Suspense>
      <TourAutostart tour={TEMPLATE_TOUR} />
    </div>
  );
}
