import {
  CONTACT_LABEL_KINDS,
  usableContactLabels,
} from "@lanjut/resume/contact-labels";
import type { Field } from "@lanjut/resume/types";
import { FieldDescription } from "@lanjut/ui/components/field";
import { A, D, S } from "@mobily/ts-belt";
import { useTranslations } from "use-intl";
import { useResumeStore } from "@/lib/store";
import { EditorStylingContactLabel } from "./editor-styling-contact-label";
import { EditorStylingContactLabelsWarning } from "./editor-styling-contact-labels-warning";

function plainValue(field: Field | undefined): string {
  if (field?.kind !== "plain") return "";
  return S.trim(field.value);
}

/** A label input for each contact that holds an address. */
export function EditorStylingContactLabels() {
  const fields = useResumeStore((state) => state.open?.header.fields);
  const labels = useResumeStore((state) => state.open?.contactLabels);
  const t = useTranslations("editor.styling");

  if (fields === undefined) return null;

  const filled = A.filter(CONTACT_LABEL_KINDS, (kind) =>
    S.isNotEmpty(plainValue(fields[kind])),
  );
  if (A.isEmpty(filled)) {
    return <FieldDescription>{t("contactLabelsEmpty")}</FieldDescription>;
  }

  const shown = D.selectKeys(usableContactLabels(labels), filled);

  return (
    <>
      {filled.map((kind) => (
        <EditorStylingContactLabel
          key={kind}
          kind={kind}
          address={plainValue(fields[kind])}
          label={labels?.[kind] ?? ""}
        />
      ))}
      {!D.isEmpty(shown) && (
        <EditorStylingContactLabelsWarning email={shown.email !== undefined} />
      )}
    </>
  );
}
