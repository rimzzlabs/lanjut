import { ScrollText } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EditorSectionVisibility } from "../ed-section-visibility";
import { EditorSectionSummaryForm } from "./ed-section-summary-form";

export function EditorSectionSummary() {
  const t = useTranslations("editor.summary");

  return (
    <AccordionItem className="relative">
      <AccordionTrigger className="items-center gap-3">
        <ScrollText className="size-4" /> {t("accordionTitle")}
      </AccordionTrigger>

      <EditorSectionVisibility type="summary" />

      <AccordionContent>
        <EditorSectionSummaryForm />
      </AccordionContent>
    </AccordionItem>
  );
}
