import type { Metadata } from "next";
import { EditorResumePreview } from "@/components/editor/editor-resume-preview";

export const metadata: Metadata = {
  title: "Editor",
};

export default function EditorPage() {
  return <EditorResumePreview />;
}
