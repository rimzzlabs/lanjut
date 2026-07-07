import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { EditorResumePreview } from "@/components/editor/editor-resume-preview";
import { TourAutostartEditor } from "@/components/tour/tour-autostart-editor";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "editor.chrome" });
  return { title: t("editorTitle") };
}

export default function EditorPage() {
  return (
    <>
      <EditorResumePreview />
      <TourAutostartEditor />
    </>
  );
}
