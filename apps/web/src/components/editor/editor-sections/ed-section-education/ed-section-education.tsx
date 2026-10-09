import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@lanjut/ui/components/accordion";
import { GraduationCapIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { EditorSectionReadiness } from "../../editor-readiness/editor-section-readiness";
import { EditorSectionVisibility } from "../ed-section-visibility";
import { sectionAnchorId } from "../section-anchor";
import { EditorSectionEducationForm } from "./ed-section-education-form";

export function EditorSectionEducation() {
  const t = useTranslations("editor.education");

  return (
    <AccordionItem
      id={sectionAnchorId("education")}
      value="education"
      className="relative"
    >
      <AccordionTrigger className="items-center gap-3">
        <GraduationCapIcon className="size-4" /> {t("accordionTitle")}
        <EditorSectionReadiness section="education" />
      </AccordionTrigger>

      <EditorSectionVisibility type="education" />

      <AccordionContent>
        <EditorSectionEducationForm />
      </AccordionContent>
    </AccordionItem>
  );
}
