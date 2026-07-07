import { ScrollText } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EditorSectionSummaryForm } from "./ed-section-summary-form";

export function EditorSectionSummary() {
  const t = useTranslations("editor.summary");

  return (
    <AccordionItem>
      <AccordionTrigger className="items-center gap-3">
        <ScrollText className="size-4" /> {t("accordionTitle")}
      </AccordionTrigger>

      <AccordionContent>
        <EditorSectionSummaryForm />
      </AccordionContent>
    </AccordionItem>
  );
}
