import { MEDIA_XL, useMediaQuery } from "@/hooks/use-media-query";
import {
  type CodeView,
  type EditorMode,
  liveDraft,
  useDeveloperModeStore,
  useEditorChromeStore,
  useEditorCodeStore,
  useResumeStore,
} from "@/lib/store";

/** The code mode shows only while Developer mode is on. */
export function useEditorMode(): EditorMode {
  const enabled = useDeveloperModeStore((state) => state.enabled);
  const mode = useEditorChromeStore((state) => state.mode);
  return enabled ? mode : "form";
}

/** Below xl a split has no room, so it shows as the code alone. */
export function useCodeView(): CodeView {
  const view = useDeveloperModeStore((state) => state.view);
  const isDesktop = useMediaQuery(MEDIA_XL);
  if (view === "split" && !isDesktop) return "code";
  return view;
}

export function useCodeDraft() {
  const open = useResumeStore((state) => state.open);
  const format = useDeveloperModeStore((state) => state.format);
  const draft = useEditorCodeStore((state) => state.draft);
  return liveDraft({ draft, open, format });
}
