import { COLOR_PARTS } from "@lanjut/resume/colors";
import { useResumeStore } from "@/lib/store";
import { EditorStylingColorRow } from "./editor-styling-color-row";

/** One color row per part: the name, the headings, the rules, the links. */
export function EditorStylingColors() {
  const hasOpen = useResumeStore((state) => state.open !== null);
  if (!hasOpen) return null;
  return (
    <>
      {COLOR_PARTS.map((part) => (
        <EditorStylingColorRow key={part} part={part} />
      ))}
    </>
  );
}
