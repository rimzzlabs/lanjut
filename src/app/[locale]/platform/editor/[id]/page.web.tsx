import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { EditorPageContent } from "@/components/editor/editor-page";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "editor.chrome" });
  return { title: t("editorTitle") };
}

export default function EditorPage() {
  return <EditorPageContent />;
}
