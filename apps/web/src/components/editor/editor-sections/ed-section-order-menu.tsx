import {
  isReorderableSection,
  presetSectionIndex,
  type Section,
  type SectionOrderPreset,
} from "@lanjut/resume";
import { Button } from "@lanjut/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@lanjut/ui/components/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@lanjut/ui/components/tooltip";
import { A, O, pipe } from "@mobily/ts-belt";
import { ListNumbersIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { useResumeStore } from "@/lib/store";

const PRESETS = [
  { value: "experience-first", labelKey: "orderExperienceFirst" },
  { value: "skills-first", labelKey: "orderSkillsFirst" },
] as const satisfies ReadonlyArray<{
  value: SectionOrderPreset;
  labelKey: string;
}>;

function isPreset(value: unknown): value is SectionOrderPreset {
  return A.some(PRESETS, (preset) => preset.value === value);
}

/** True when the reorderable sections already follow the preset's order. */
function followsPreset(
  sections: ReadonlyArray<Section>,
  preset: SectionOrderPreset,
): boolean {
  const indices = pipe(
    sections,
    A.filter((section) => isReorderableSection(section.type)),
    A.map((section) => presetSectionIndex(preset, section.type)),
  );
  return pipe(
    A.zip(indices, A.drop(indices, 1)),
    A.every(([previous, value]) => previous <= value),
  );
}

/** The order the sections follow now, or none after a manual reorder. */
function currentPreset(sections: ReadonlyArray<Section>): string {
  return pipe(
    PRESETS,
    A.find((preset) => followsPreset(sections, preset.value)),
    O.mapWithDefault("", (preset) => preset.value),
  );
}

/**
 * Applies a whole section order in one undoable step: experience first (the
 * standard order) or skills first. Entries keep their date order either way.
 */
export function EditorSectionOrderMenu() {
  const open = useResumeStore((state) => state.open);
  const applySectionOrder = useResumeStore((state) => state.applySectionOrder);
  const t = useTranslations("editor.chrome");
  const value = open ? currentPreset(open.sections) : "";

  return (
    <DropdownMenu modal={false}>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              render={
                <Button size="icon-sm" variant="ghost" disabled={!open} />
              }
            />
          }
        >
          <ListNumbersIcon />
          <span className="sr-only">{t("sectionOrder")}</span>
        </TooltipTrigger>
        <TooltipContent>{t("sectionOrder")}</TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("sectionOrder")}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={value}
            onValueChange={(next) => {
              if (isPreset(next)) applySectionOrder(next);
            }}
          >
            {PRESETS.map((preset) => (
              <DropdownMenuRadioItem key={preset.value} value={preset.value}>
                {t(preset.labelKey)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
