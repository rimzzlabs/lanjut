import { FolderGit2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EditorSectionProjectsForm } from "./ed-section-projects-form";

export function EditorSectionProjects() {
  const t = useTranslations("editor.projects");

  return (
    <AccordionItem>
      <AccordionTrigger className="items-center gap-3">
        <FolderGit2 className="size-4" /> {t("accordionTitle")}
      </AccordionTrigger>

      <AccordionContent>
        <EditorSectionProjectsForm />
      </AccordionContent>
    </AccordionItem>
  );
}
