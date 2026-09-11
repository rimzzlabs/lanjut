import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EditorPageContent } from "@/components/editor/editor-page";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "editor.chrome" });
  return { title: t("editorTitle") };
}

export default async function EditorRoutePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <EditorPageContent />;
}
