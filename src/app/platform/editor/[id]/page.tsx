import type { Metadata } from "next";
import { EditorResumePreview } from "@/components/editor/editor-resume-preview";
import { TourAutostartEditor } from "@/components/tour/tour-autostart-editor";

export const metadata: Metadata = {
  title: "Editor",
};

export default function EditorPage() {
  return (
    <>
      <EditorResumePreview />
      <TourAutostartEditor />
    </>
  );
}
