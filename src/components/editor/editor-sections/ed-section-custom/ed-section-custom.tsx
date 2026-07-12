"use client";

import { Shapes } from "lucide-react";
import { useTranslations } from "next-intl";
import { SegmentedControl } from "@/components/shared/segmented-control";
import { TruncatedLabel } from "@/components/shared/truncated-label";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { CustomVariant } from "@/lib/resume";
import { useResumeStore } from "@/lib/store";
import { EditorSectionCustomBodyForm } from "./ed-section-custom-body-form";
import { EditorSectionCustomListForm } from "./ed-section-custom-list-form";
import { EditorSectionCustomMenu } from "./ed-section-custom-menu";

interface EditorSectionCustomProps {
  sectionId: string;
}

export function EditorSectionCustom(props: EditorSectionCustomProps) {
  const section = useResumeStore((state) =>
    state.open?.sections.find((s) => s.id === props.sectionId),
  );
  const setCustomVariant = useResumeStore((state) => state.setCustomVariant);
  const t = useTranslations("editor.custom");

  if (!section || section.type !== "custom") return null;
  const variant = section.variant ?? "rich";
  const label = section.title.trim() || t("defaultTitle");

  return (
    <AccordionItem value={section.id} className="relative">
      <AccordionTrigger className="min-w-0 items-center gap-3">
        <Shapes className="size-4 shrink-0" />
        {/* mr reserves room for the absolutely-positioned menu so the title
            truncates before it, leaving order: title, menu, chevron. */}
        <TruncatedLabel
          text={label}
          className="mr-9 min-w-0 flex-1 text-left"
        />
      </AccordionTrigger>

      {/* The menu sits in the trigger row (not nested in the trigger button, and
          not inside the panel) so a section can be renamed or removed without
          expanding it first. It is placed just left of the trigger's chevron. */}
      <div className="absolute top-2.5 right-9 z-10">
        <EditorSectionCustomMenu sectionId={section.id} title={section.title} />
      </div>

      <AccordionContent>
        <div className="mb-4">
          <SegmentedControl
            aria-label={t("variantLabel")}
            value={variant}
            onValueChange={(value) =>
              setCustomVariant(section.id, value as CustomVariant)
            }
            items={[
              {
                value: "rich",
                label: t("variantText"),
                ariaLabel: t("variantTextAria"),
              },
              {
                value: "list",
                label: t("variantList"),
                ariaLabel: t("variantListAria"),
              },
            ]}
          />
        </div>

        {variant === "list" ? (
          <EditorSectionCustomListForm
            key={`${section.id}-list`}
            sectionId={section.id}
          />
        ) : (
          <EditorSectionCustomBodyForm
            key={`${section.id}-rich`}
            sectionId={section.id}
          />
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
