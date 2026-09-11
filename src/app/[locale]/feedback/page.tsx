import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { FeedbackPanel } from "@/components/feedback/feedback-panel";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "feedback" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default function FeedbackPage() {
  return (
    <Suspense>
      <FeedbackPanel />
    </Suspense>
  );
}
