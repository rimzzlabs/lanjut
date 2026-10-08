import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@lanjut/ui/components/accordion";
import { SparkleIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { EditorSectionVisibility } from "../ed-section-visibility";
import { EditorSectionSkillsForm } from "./ed-section-skills-form";

export function EditorSectionSkills() {
  const t = useTranslations("editor.skills");

  return (
    <AccordionItem value="skills" className="relative">
      <AccordionTrigger className="items-center gap-3">
        <SparkleIcon className="size-4" /> {t("accordionTitle")}
      </AccordionTrigger>

      <EditorSectionVisibility type="skills" />

      <AccordionContent>
        <EditorSectionSkillsForm />
      </AccordionContent>
    </AccordionItem>
  );
}
