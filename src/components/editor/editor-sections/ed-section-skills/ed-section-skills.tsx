import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EditorSectionVisibility } from "../ed-section-visibility";
import { EditorSectionSkillsForm } from "./ed-section-skills-form";

export function EditorSectionSkills() {
  const t = useTranslations("editor.skills");

  return (
    <AccordionItem className="relative">
      <AccordionTrigger className="items-center gap-3">
        <Sparkles className="size-4" /> {t("accordionTitle")}
      </AccordionTrigger>

      <EditorSectionVisibility type="skills" />

      <AccordionContent>
        <EditorSectionSkillsForm />
      </AccordionContent>
    </AccordionItem>
  );
}
