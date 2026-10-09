import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@lanjut/ui/components/accordion";
import { SparkleIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { EditorSectionReadiness } from "../../editor-readiness/editor-section-readiness";
import { EditorSectionVisibility } from "../ed-section-visibility";
import { sectionAnchorId } from "../section-anchor";
import { EditorSectionSkillsForm } from "./ed-section-skills-form";

export function EditorSectionSkills() {
  const t = useTranslations("editor.skills");

  return (
    <AccordionItem
      id={sectionAnchorId("skills")}
      value="skills"
      className="relative"
    >
      <AccordionTrigger className="items-center gap-3">
        <SparkleIcon className="size-4" /> {t("accordionTitle")}
        <EditorSectionReadiness section="skills" />
      </AccordionTrigger>

      <EditorSectionVisibility type="skills" />

      <AccordionContent>
        <EditorSectionSkillsForm />
      </AccordionContent>
    </AccordionItem>
  );
}
