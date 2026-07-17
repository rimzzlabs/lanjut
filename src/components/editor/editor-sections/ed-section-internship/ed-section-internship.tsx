import { Backpack } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EditorSectionVisibility } from "../ed-section-visibility";
import { EditorSectionInternshipForm } from "./ed-section-internship-form";

export function EditorSectionInternship() {
  const t = useTranslations("editor.internship");

  return (
    <AccordionItem className="relative">
      <AccordionTrigger className="items-center gap-3">
        <Backpack className="size-4" /> {t("accordionTitle")}
      </AccordionTrigger>

      <EditorSectionVisibility type="internship" />

      <AccordionContent>
        <EditorSectionInternshipForm />
      </AccordionContent>
    </AccordionItem>
  );
}
