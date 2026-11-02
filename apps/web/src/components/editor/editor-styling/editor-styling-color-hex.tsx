import {
  type ColorPart,
  contrastFloor,
  contrastOnPaper,
  normalizeHex,
} from "@lanjut/resume/colors";
import { Field, FieldError } from "@lanjut/ui/components/field";
import { Input } from "@lanjut/ui/components/input";
import { O, S } from "@mobily/ts-belt";
import { useId, useState } from "react";
import { useFormatter, useTranslations } from "use-intl";

interface EditorStylingColorHexProps {
  part: ColorPart;
  color: string | undefined;
  onCommit: (hex: string) => void;
}

type HexCheck =
  | { kind: "empty" }
  | { kind: "invalid" }
  | { kind: "low"; ratio: number }
  | { kind: "ok"; hex: string };

// Only three or six digits make a color. Other lengths are still being typed
// and show no error, unless a character is not a hex digit.
function checkHex(part: ColorPart, text: string): HexCheck {
  const digits = S.replaceByRe(S.trim(text), /^#/, "");
  if (!/^[0-9a-fA-F]*$/.test(digits) || S.length(digits) > 6) {
    return { kind: "invalid" };
  }
  return O.match(
    normalizeHex(digits),
    (hex): HexCheck => {
      const ratio = contrastOnPaper(hex);
      if (ratio < contrastFloor(part)) return { kind: "low", ratio };
      return { kind: "ok", hex };
    },
    (): HexCheck => ({ kind: "empty" }),
  );
}

/**
 * A custom color as hex. A color below the part's AA floor stays a draft and
 * never reaches the résumé.
 */
export function EditorStylingColorHex(props: EditorStylingColorHexProps) {
  const [draft, setDraft] = useState(props.color ?? "");
  const [shown, setShown] = useState(props.color);
  const t = useTranslations("editor.styling");
  const format = useFormatter();
  const id = useId();

  // A swatch, a reset, or an undo changed the color: show it, unless it is
  // the color this draft already reads as.
  if (props.color !== shown) {
    setShown(props.color);
    if (O.toUndefined(normalizeHex(draft)) !== props.color) {
      setDraft(props.color ?? "");
    }
  }

  const check = checkHex(props.part, draft);

  function onChange(text: string) {
    setDraft(text);
    const next = checkHex(props.part, text);
    if (next.kind === "ok" && next.hex !== props.color)
      props.onCommit(next.hex);
  }

  return (
    <Field data-invalid={check.kind === "invalid" || check.kind === "low"}>
      <Input
        id={id}
        aria-label={t("colorHex")}
        placeholder={t("colorHexPlaceholder")}
        autoComplete="off"
        spellCheck={false}
        maxLength={7}
        className="font-mono"
        aria-invalid={check.kind === "invalid" || check.kind === "low"}
        value={draft}
        onChange={(event) => onChange(event.target.value)}
      />
      {check.kind === "invalid" && <FieldError>{t("colorInvalid")}</FieldError>}
      {check.kind === "low" && (
        <FieldError>
          {t("colorTooLight", {
            ratio: format.number(check.ratio, { maximumFractionDigits: 1 }),
            min: contrastFloor(props.part),
          })}
        </FieldError>
      )}
    </Field>
  );
}
