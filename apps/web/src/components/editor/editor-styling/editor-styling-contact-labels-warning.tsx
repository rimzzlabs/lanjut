import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@lanjut/ui/components/alert";
import { WarningIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";

/** Most ATS read only the visible text, so a label hides the address. */
export function EditorStylingContactLabelsWarning(props: { email: boolean }) {
  const t = useTranslations("editor.styling");
  return (
    <Alert role="none">
      <WarningIcon />
      <AlertTitle>{t("contactLabelsWarningTitle")}</AlertTitle>
      <AlertDescription>
        {t("contactLabelsWarning")}
        {props.email && ` ${t("contactLabelsEmailWarning")}`}
      </AlertDescription>
    </Alert>
  );
}
