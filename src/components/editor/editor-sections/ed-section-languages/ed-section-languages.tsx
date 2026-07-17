import { Languages } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EditorSectionVisibility } from "../ed-section-visibility";
import { EditorSectionLanguagesForm } from "./ed-section-languages-form";

export function EditorSectionLanguages() {
  const t = useTranslations("editor.languages");

  return (
    <AccordionItem className="relative">
      <AccordionTrigger className="items-center gap-3">
        <Languages className="size-4" /> {t("accordionTitle")}
      </AccordionTrigger>

      <EditorSectionVisibility type="languages" />

      <AccordionContent>
        <EditorSectionLanguagesForm />
      </AccordionContent>
    </AccordionItem>
  );
}
