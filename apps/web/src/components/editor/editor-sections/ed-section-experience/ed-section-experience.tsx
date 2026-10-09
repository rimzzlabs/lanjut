import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@lanjut/ui/components/accordion";
import { BriefcaseIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { EditorSectionReadiness } from "../../editor-readiness/editor-section-readiness";
import { EditorSectionVisibility } from "../ed-section-visibility";
import { sectionAnchorId } from "../section-anchor";
import { EditorSectionExperienceForm } from "./ed-section-experience-form";

export function EditorSectionExperience() {
  const t = useTranslations("editor.experience");

  return (
    <AccordionItem
      id={sectionAnchorId("experience")}
      value="experience"
      className="relative"
    >
      <AccordionTrigger className="items-center gap-3">
        <BriefcaseIcon className="size-4" /> {t("accordionTitle")}
        <EditorSectionReadiness section="experience" />
      </AccordionTrigger>

      <EditorSectionVisibility type="experience" />

      <AccordionContent>
        <EditorSectionExperienceForm />
      </AccordionContent>
    </AccordionItem>
  );
}
