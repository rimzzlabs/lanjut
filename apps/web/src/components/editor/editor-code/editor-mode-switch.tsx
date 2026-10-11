import { useTranslations } from "use-intl";
import { SegmentedControl } from "@/components/shared/segmented-control";
import { useEditorMode } from "@/hooks/use-editor-mode";
import {
  runAfterCodeGuard,
  useDeveloperModeStore,
  useEditorChromeStore,
  useResumeStore,
} from "@/lib/store";

export function EditorModeSwitch() {
  const t = useTranslations("editor.code");
  const enabled = useDeveloperModeStore((state) => state.enabled);
  const ready = useResumeStore((state) => state.openStatus === "ready");
  const setMode = useEditorChromeStore((state) => state.setMode);
  const mode = useEditorMode();

  if (!enabled || !ready) return null;

  const onModeChange = (value: string) => {
    if (value === "code") setMode("code");
    if (value === "form") runAfterCodeGuard(() => setMode("form"));
  };

  return (
    <SegmentedControl
      aria-label={t("modeLabel")}
      value={mode}
      onValueChange={onModeChange}
      items={[
        { value: "form", label: t("modeForm") },
        { value: "code", label: t("modeCode") },
      ]}
    />
  );
}
