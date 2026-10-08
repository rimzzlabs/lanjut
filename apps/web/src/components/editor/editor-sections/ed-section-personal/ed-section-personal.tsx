import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@lanjut/ui/components/accordion";
import { UserIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { EditorSectionPersonalForm } from "./ed-section-personal-form";

export function EditorSectionPersonal() {
  const t = useTranslations("editor.personal");

  return (
    <AccordionItem value="personal">
      <AccordionTrigger className="items-center gap-3">
        <UserIcon className="size-4" />
        {t("accordionTitle")}
      </AccordionTrigger>
      <AccordionContent>
        <EditorSectionPersonalForm />
      </AccordionContent>
    </AccordionItem>
  );
}
