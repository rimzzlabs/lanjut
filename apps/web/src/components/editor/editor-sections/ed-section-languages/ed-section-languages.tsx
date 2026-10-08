import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@lanjut/ui/components/accordion";
import { TranslateIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { EditorSectionVisibility } from "../ed-section-visibility";
import { EditorSectionLanguagesForm } from "./ed-section-languages-form";

export function EditorSectionLanguages() {
  const t = useTranslations("editor.languages");

  return (
    <AccordionItem value="languages" className="relative">
      <AccordionTrigger className="items-center gap-3">
        <TranslateIcon className="size-4" /> {t("accordionTitle")}
      </AccordionTrigger>

      <EditorSectionVisibility type="languages" />

      <AccordionContent>
        <EditorSectionLanguagesForm />
      </AccordionContent>
    </AccordionItem>
  );
}
