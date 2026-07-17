import { GraduationCap } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EditorSectionVisibility } from "../ed-section-visibility";
import { EditorSectionEducationForm } from "./ed-section-education-form";

export function EditorSectionEducation() {
  const t = useTranslations("editor.education");

  return (
    <AccordionItem className="relative">
      <AccordionTrigger className="items-center gap-3">
        <GraduationCap className="size-4" /> {t("accordionTitle")}
      </AccordionTrigger>

      <EditorSectionVisibility type="education" />

      <AccordionContent>
        <EditorSectionEducationForm />
      </AccordionContent>
    </AccordionItem>
  );
}
