import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@lanjut/ui/components/accordion";
import { ScrollIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { EditorSectionReadiness } from "../../editor-readiness/editor-section-readiness";
import { EditorSectionVisibility } from "../ed-section-visibility";
import { sectionAnchorId } from "../section-anchor";
import { EditorSectionSummaryForm } from "./ed-section-summary-form";

export function EditorSectionSummary() {
  const t = useTranslations("editor.summary");

  return (
    <AccordionItem
      id={sectionAnchorId("summary")}
      value="summary"
      className="relative"
    >
      <AccordionTrigger className="items-center gap-3">
        <ScrollIcon className="size-4" /> {t("accordionTitle")}
        <EditorSectionReadiness section="summary" />
      </AccordionTrigger>

      <EditorSectionVisibility type="summary" />

      <AccordionContent>
        <EditorSectionSummaryForm />
      </AccordionContent>
    </AccordionItem>
  );
}
