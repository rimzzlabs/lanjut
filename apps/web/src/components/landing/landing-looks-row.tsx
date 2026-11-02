import type { TemplateId } from "@lanjut/resume/templates";
import { Button } from "@lanjut/ui/components/button";
import { CheckIcon } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import type { ResumePreview } from "@/components/editor/resume-preview";
import { ResumeThumbnail } from "@/components/editor/resume-thumbnail";
import { useLandingDraftStore } from "@/lib/store";
import { LandingLooksRowFrame } from "./landing-looks-row-frame";

interface LandingLooksRowProps {
  id: TemplateId;
  name: string;
  look: string;
  preview: ResumePreview;
  open: boolean;
  onSelect: () => void;
}

export function LandingLooksRow(props: LandingLooksRowProps) {
  const t = useTranslations("landing");
  const inHero = useLandingDraftStore((state) => state.template === props.id);
  const setTemplate = useLandingDraftStore((state) => state.setTemplate);

  return (
    <LandingLooksRowFrame
      open={props.open}
      onSelect={props.onSelect}
      title={props.name}
      aside={props.look}
    >
      <div className="mb-4 aspect-3/4 w-full max-w-sm overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black/10 lg:hidden">
        <ResumeThumbnail resume={props.preview} template={props.id} />
      </div>
      <p className="max-w-[44ch] text-sm text-muted-foreground">
        {t(`looksShowcase.${props.id}`)}
      </p>
      <Button
        variant="outline"
        size="sm"
        className="mt-3"
        aria-pressed={inHero}
        onClick={() => setTemplate(props.id)}
      >
        {inHero && <CheckIcon aria-hidden weight="bold" />}
        {inHero ? t("looksTried") : t("looksTry")}
      </Button>
    </LandingLooksRowFrame>
  );
}
