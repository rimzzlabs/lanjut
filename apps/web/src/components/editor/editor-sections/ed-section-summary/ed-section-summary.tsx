import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@lanjut/ui/components/accordion";
import { ScrollIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { EditorSectionVisibility } from "../ed-section-visibility";
import { EditorSectionSummaryForm } from "./ed-section-summary-form";

export function EditorSectionSummary() {
  const t = useTranslations("editor.summary");

  return (
    <AccordionItem value="summary" className="relative">
      <AccordionTrigger className="items-center gap-3">
        <ScrollIcon className="size-4" /> {t("accordionTitle")}
      </AccordionTrigger>

      <EditorSectionVisibility type="summary" />

      <AccordionContent>
        <EditorSectionSummaryForm />
      </AccordionContent>
    </AccordionItem>
  );
}
