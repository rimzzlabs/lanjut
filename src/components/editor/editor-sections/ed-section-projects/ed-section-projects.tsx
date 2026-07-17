import { FolderGit2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EditorSectionVisibility } from "../ed-section-visibility";
import { EditorSectionProjectsForm } from "./ed-section-projects-form";

export function EditorSectionProjects() {
  const t = useTranslations("editor.projects");

  return (
    <AccordionItem className="relative">
      <AccordionTrigger className="items-center gap-3">
        <FolderGit2 className="size-4" /> {t("accordionTitle")}
      </AccordionTrigger>

      <EditorSectionVisibility type="projects" />

      <AccordionContent>
        <EditorSectionProjectsForm />
      </AccordionContent>
    </AccordionItem>
  );
}
