import {
  FileArrowUpIcon,
  FileDashedIcon,
  FileTextIcon,
  type Icon,
  SquaresFourIcon,
} from "@phosphor-icons/react";
import { useId, useState } from "react";
import { useTranslations } from "use-intl";
import type { ResumeSource } from "@/lib/forms/resume";
import { TEMPLATE_PATHNAME } from "@/lib/routes";
import { PlatformResumeCreateSheet } from "../platform-resume-create/platform-resume-create-sheet";
import { PlatformSectionHeading } from "../platform-section-heading";
import {
  PlatformLibraryStartButton,
  PlatformLibraryStartLink,
} from "./platform-library-start-item";

interface StartOption {
  source: ResumeSource;
  labelKey: string;
  hintKey: string;
  icon: Icon;
}

const START_OPTIONS: ReadonlyArray<StartOption> = [
  {
    source: "empty",
    labelKey: "sourceEmpty",
    hintKey: "sourceEmptyHint",
    icon: FileDashedIcon,
  },
  {
    source: "sample",
    labelKey: "sourceSample",
    hintKey: "sourceSampleHint",
    icon: FileTextIcon,
  },
  {
    source: "import",
    labelKey: "sourceImport",
    hintKey: "sourceImportHint",
    icon: FileArrowUpIcon,
  },
];

/**
 * The ways to start a résumé, one tile each. A source tile opens the create
 * sheet with that source chosen; the last tile goes to the templates.
 */
export function PlatformLibraryStart() {
  const t = useTranslations();
  const headingId = useId();
  const [source, setSource] = useState<ResumeSource>("sample");
  const [open, setOpen] = useState(false);

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <PlatformSectionHeading id={headingId}>
        {t("forms.create.title")}
      </PlatformSectionHeading>

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {START_OPTIONS.map((option) => (
          <li key={option.source}>
            <PlatformLibraryStartButton
              icon={option.icon}
              label={t(`forms.create.${option.labelKey}`)}
              hint={t(`forms.create.${option.hintKey}`)}
              onClick={() => {
                setSource(option.source);
                setOpen(true);
              }}
            />
          </li>
        ))}
        <li>
          <PlatformLibraryStartLink
            href={TEMPLATE_PATHNAME}
            icon={SquaresFourIcon}
            label={t("platform.emptyState.browseTemplates")}
            hint={t("platform.library.templateHint")}
          />
        </li>
      </ul>

      <PlatformResumeCreateSheet
        key={source}
        initialSource={source}
        open={open}
        onOpenChange={setOpen}
      />
    </section>
  );
}
