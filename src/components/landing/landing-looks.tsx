import { useMemo } from "react";
import { useTranslations } from "use-intl";
import type { ResumePreview } from "@/components/editor/resume-preview";
import { ResumeThumbnail } from "@/components/editor/resume-thumbnail";
import { resumeToPreview } from "@/components/editor/resume-to-preview";
import {
  type IslandProps,
  IslandProviders,
} from "@/components/shared/providers";
import { useLandingDraftStore } from "@/lib/store";
import { TEMPLATES, type TemplateId } from "@/lib/templates";
import { cn } from "@/lib/utils";
import { draftToResume } from "./landing-draft-resume";

const LOOK_KEYS: Record<TemplateId, string> = {
  awal: "lookAwal",
  ketat: "lookKetat",
  luasa: "lookLuasa",
  tebal: "lookTebal",
  klasik: "lookKlasik",
  ketik: "lookKetik",
};

/** All six templates drawn live with the visitor's draft; picking one restyles the hero too. */
export function LandingLooks(props: IslandProps) {
  return (
    <IslandProviders locale={props.locale} pathname={props.pathname}>
      <LandingLooksGrid />
    </IslandProviders>
  );
}

function LandingLooksGrid() {
  const draft = useLandingDraftStore((state) => state.draft);
  const template = useLandingDraftStore((state) => state.template);
  const preview = useMemo(() => resumeToPreview(draftToResume(draft)), [draft]);

  return (
    <ul className="mx-[-4.5%] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[4.5%] pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-x-5 sm:gap-y-8 sm:overflow-visible sm:px-0">
      {TEMPLATES.map((item) => (
        <LandingLookItem
          key={item.id}
          id={item.id}
          name={item.name}
          preview={preview}
          selected={item.id === template}
        />
      ))}
    </ul>
  );
}

interface LandingLookItemProps {
  id: TemplateId;
  name: string;
  preview: ResumePreview;
  selected: boolean;
}

function LandingLookItem(props: LandingLookItemProps) {
  const t = useTranslations("landing");
  const setTemplate = useLandingDraftStore((state) => state.setTemplate);

  return (
    <li className="w-[62%] shrink-0 snap-start sm:w-auto">
      <button
        type="button"
        aria-pressed={props.selected}
        aria-label={t("looksPick", { name: props.name })}
        onClick={() => setTemplate(props.id)}
        className="group block w-full rounded-xl text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div
          className={cn(
            "aspect-3/4 overflow-hidden rounded-xl bg-white ring-1 ring-black/10 transition-[box-shadow,translate] duration-200 group-hover:-translate-y-0.5",
            props.selected && "ring-2 ring-foreground",
          )}
        >
          <ResumeThumbnail resume={props.preview} template={props.id} />
        </div>
        <p className="mt-3 flex items-baseline justify-between gap-3">
          <span className="font-semibold">{props.name}</span>
          <span className="text-right text-xs text-muted-foreground">
            {t(LOOK_KEYS[props.id])}
          </span>
        </p>
      </button>
    </li>
  );
}
