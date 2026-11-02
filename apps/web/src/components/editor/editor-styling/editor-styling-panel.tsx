import {
  ArrowsOutLineVerticalIcon,
  GlobeSimpleIcon,
  PaletteIcon,
  TagIcon,
  TextAaIcon,
} from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { EditorPanelSection } from "../editor-panel-section";
import { sectionAnchorId } from "../editor-sections/section-anchor";
import { EditorStylingColors } from "./editor-styling-colors";
import { EditorStylingContactLabels } from "./editor-styling-contact-labels";
import { EditorStylingDensity } from "./editor-styling-density";
import { EditorStylingFont } from "./editor-styling-font";
import { EditorStylingFontSize } from "./editor-styling-font-size";
import { EditorStylingIcons } from "./editor-styling-icons";
import { EditorStylingLanguage } from "./editor-styling-language";
import { EditorStylingLetterSpacing } from "./editor-styling-letter-spacing";
import { EditorStylingLineHeight } from "./editor-styling-line-height";
import { EditorStylingReset } from "./editor-styling-reset";
import { EditorStylingSectionSpacing } from "./editor-styling-section-spacing";

/**
 * The Styling tab, grouped by what the person wants to change: the language
 * and icons, the text, the room around it, the contact labels, and the colors.
 */
export function EditorStylingPanel() {
  const t = useTranslations("editor.styling");

  return (
    <div className="flex flex-col divide-y px-4">
      <EditorPanelSection
        icon={<GlobeSimpleIcon />}
        title={t("general")}
        description={t("generalHint")}
      >
        <EditorStylingLanguage />
        <EditorStylingIcons />
      </EditorPanelSection>

      <EditorPanelSection
        icon={<TextAaIcon />}
        title={t("typography")}
        description={t("typographyHint")}
        action={
          <EditorStylingReset group="typography" label={t("resetTypography")} />
        }
      >
        <EditorStylingFont />
        <EditorStylingFontSize />
      </EditorPanelSection>

      <EditorPanelSection
        icon={<ArrowsOutLineVerticalIcon />}
        title={t("spacing")}
        description={t("spacingHint")}
        action={
          <EditorStylingReset group="spacing" label={t("resetSpacing")} />
        }
      >
        <EditorStylingDensity />
        <EditorStylingSectionSpacing />
        <EditorStylingLineHeight />
        <EditorStylingLetterSpacing />
      </EditorPanelSection>

      <EditorPanelSection
        id={sectionAnchorId("styling")}
        icon={<TagIcon />}
        title={t("contactLabels")}
        description={t("contactLabelsHint")}
        action={
          <EditorStylingReset
            group="contactLabels"
            label={t("resetContactLabels")}
          />
        }
      >
        <EditorStylingContactLabels />
      </EditorPanelSection>

      <EditorPanelSection
        icon={<PaletteIcon />}
        title={t("colors")}
        description={t("colorsHint")}
        action={<EditorStylingReset group="colors" label={t("resetColors")} />}
      >
        <EditorStylingColors />
      </EditorPanelSection>
    </div>
  );
}
