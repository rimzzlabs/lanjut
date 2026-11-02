import {
  COLOR_SWATCHES,
  type ColorPart,
  isAllowedColor,
} from "@lanjut/resume/colors";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@lanjut/ui/components/toggle-group";
import { A, O, pipe, S } from "@mobily/ts-belt";
import { ProhibitIcon } from "@phosphor-icons/react";
import { useId } from "react";
import { useTranslations } from "use-intl";
import { useResumeStore } from "@/lib/store";
import { EditorStylingColorContrast } from "./editor-styling-color-contrast";
import { EditorStylingColorHex } from "./editor-styling-color-hex";
import { withColor } from "./styling-values";

const LABEL_KEYS: Record<ColorPart, string> = {
  name: "colorName",
  heading: "colorHeading",
  rule: "colorRule",
  link: "colorLink",
};

// The toggle value of the template's own color.
const TEMPLATE = "template";

/** One part's color: the template's, a swatch, or a custom hex value. */
export function EditorStylingColorRow(props: { part: ColorPart }) {
  const color = useResumeStore((state) => {
    const value = state.open?.colors?.[props.part];
    return isAllowedColor(props.part, value) ? value : undefined;
  });
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.styling");
  const labelId = useId();

  function setColor(hex: string | undefined) {
    updateOpen((resume) => withColor(resume, props.part, hex));
  }

  function onValueChange(values: ReadonlyArray<string>) {
    pipe(
      A.head(values),
      O.filter(S.isNotEmpty),
      O.tap((value) => setColor(value === TEMPLATE ? undefined : value)),
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span id={labelId} className="text-sm text-muted-foreground">
          {t(LABEL_KEYS[props.part])}
        </span>
        {color && <EditorStylingColorContrast part={props.part} hex={color} />}
      </div>
      <ToggleGroup
        aria-labelledby={labelId}
        size="sm"
        spacing={1}
        className="flex-wrap"
        value={[color ?? TEMPLATE]}
        onValueChange={onValueChange}
      >
        <ToggleGroupItem value={TEMPLATE} aria-label={t("colorTemplate")}>
          <ProhibitIcon />
        </ToggleGroupItem>
        {COLOR_SWATCHES.map((swatch) => (
          <ToggleGroupItem
            key={swatch.id}
            value={swatch.hex}
            aria-label={t(`swatches.${swatch.id}`)}
          >
            <span
              aria-hidden
              className="size-4 rounded-full"
              style={{ backgroundColor: swatch.hex }}
            />
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <EditorStylingColorHex
        part={props.part}
        color={color}
        onCommit={setColor}
      />
    </div>
  );
}
