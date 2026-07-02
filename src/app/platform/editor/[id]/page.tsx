import { ResumeDocument } from "@/components/editor/resume-document";
import { RESUME_PREVIEW_FIXTURE } from "@/components/editor/resume-preview-data";

export default function EditorPage() {
  return <ResumeDocument resume={RESUME_PREVIEW_FIXTURE} />;
}
