import { A } from "@mobily/ts-belt";
import {
  CodeIcon,
  EyeIcon,
  SquareSplitHorizontalIcon,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useTranslations } from "use-intl";
import { SegmentedControl } from "@/components/shared/segmented-control";
import { useCodeView } from "@/hooks/use-editor-mode";
import { MEDIA_XL, useMediaQuery } from "@/hooks/use-media-query";
import { type CodeView, useDeveloperModeStore } from "@/lib/store";

const VIEWS: ReadonlyArray<{
  value: CodeView;
  labelKey: string;
  icon: ReactNode;
}> = [
  { value: "code", labelKey: "viewCode", icon: <CodeIcon /> },
  {
    value: "split",
    labelKey: "viewSplit",
    icon: <SquareSplitHorizontalIcon />,
  },
  { value: "preview", labelKey: "viewPreview", icon: <EyeIcon /> },
];

function isCodeView(value: string): value is CodeView {
  return A.some(VIEWS, (view) => view.value === value);
}

/** Code, split, or preview, as icons. Below xl a split has no room, so it is left out. */
export function EditorViewSwitch() {
  const t = useTranslations("editor.code");
  const view = useCodeView();
  const setView = useDeveloperModeStore((state) => state.setView);
  const isDesktop = useMediaQuery(MEDIA_XL);
  const views = A.filter(VIEWS, (item) => isDesktop || item.value !== "split");

  return (
    <SegmentedControl
      aria-label={t("viewLabel")}
      value={view}
      onValueChange={(value) => {
        if (isCodeView(value)) setView(value);
      }}
      items={A.map(views, (item) => ({
        value: item.value,
        label: t(item.labelKey),
        icon: item.icon,
      }))}
    />
  );
}
