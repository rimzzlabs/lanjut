import {
  type ColorPart,
  contrastLevel,
  contrastOnPaper,
} from "@lanjut/resume/colors";
import { Badge } from "@lanjut/ui/components/badge";
import { useFormatter, useTranslations } from "use-intl";

/** The contrast of a color on the paper, and the WCAG level it reaches. */
export function EditorStylingColorContrast(props: {
  part: ColorPart;
  hex: string;
}) {
  const t = useTranslations("editor.styling");
  const format = useFormatter();
  const ratio = format.number(contrastOnPaper(props.hex), {
    maximumFractionDigits: 1,
  });
  return (
    <Badge variant="secondary">
      {t("contrast", { level: contrastLevel(props.part, props.hex), ratio })}
    </Badge>
  );
}
