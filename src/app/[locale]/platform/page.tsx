import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { PlatformEmptyState } from "@/components/platform/platform-empty-state";
import { PlatformLibraryTour } from "@/components/platform/platform-library-tour";
import { PlatformResumeGrid } from "@/components/platform/platform-resume-grid/platform-resume-grid";
import { PlatformResumeToolbar } from "@/components/platform/platform-resume-toolbar";
import { PlatformResumeUnreadableNotice } from "@/components/platform/platform-resume-unreadable-notice";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "platform.sidebar" });
  return { title: t("dashboard") };
}

export default async function PlatformPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "platform.sidebar" });

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <header className="border-b border-border pb-4">
        <h1 className="text-xl font-semibold tracking-tight">
          {t("myResume")}
        </h1>
      </header>
      <Suspense>
        <PlatformResumeToolbar />
        <PlatformResumeUnreadableNotice />
        <PlatformResumeGrid />
        <PlatformLibraryTour />
      </Suspense>
      <PlatformEmptyState />
    </div>
  );
}
