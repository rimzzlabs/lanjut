import { TourAutostartEditor } from "../tour/tour-autostart-editor";
import { EditorResumePreview } from "./editor-resume-preview";

export function EditorPageContent() {
  return (
    <>
      <EditorResumePreview />
      <TourAutostartEditor />
    </>
  );
}
