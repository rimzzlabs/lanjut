import type { ResumeLanguage } from "@lanjut/resume";
import { A } from "@mobily/ts-belt";
import { useMotionValueEvent, useScroll } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "use-intl";
import { resumeToPreview } from "@/components/editor/resume-to-preview";
import { IslandProviders } from "@/components/shared/island-providers";
import type { IslandProps } from "@/components/shared/providers";
import { MEDIA_LG } from "@/hooks/use-media-query";
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion-preference";
import { useLandingDraftStore } from "@/lib/store";
import { draftToResume } from "./landing-draft-resume";
import { LandingLooksList } from "./landing-looks-list";
import { LANDING_SHOWCASE } from "./landing-looks-showcase";
import { LandingLooksStage } from "./landing-looks-stage";

/** The five showcased templates, then the closing "see more" row. */
const STATES = A.length(LANDING_SHOWCASE) + 1;

/**
 * Five templates told one at a time, drawn live with the visitor's draft. From
 * `lg` the section pins for one screen while the page scrolls through a tall
 * track: the scroll picks the open row, and the page beside it fades to that
 * template. Below `lg` nothing pins, and the rows work as tabs.
 */
export function LandingLooks(props: IslandProps) {
  return (
    <IslandProviders locale={props.locale} pathname={props.pathname}>
      <LandingLooksShowcase />
    </IslandProviders>
  );
}

function LandingLooksShowcase() {
  const t = useTranslations("landing");
  const draft = useLandingDraftStore((state) => state.draft);
  const language = useLocale() as ResumeLanguage;
  const preview = useMemo(
    () => resumeToPreview(draftToResume(draft, language)),
    [draft, language],
  );
  const reduceMotion = useReducedMotionPreference();
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: track,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (!window.matchMedia(MEDIA_LG).matches) return;
    setActive(Math.min(STATES - 1, Math.floor(progress * STATES)));
  });

  function select(index: number) {
    setActive(index);
    const element = track.current;
    if (!element || !window.matchMedia(MEDIA_LG).matches) return;
    // Land in the middle of that row's share of the track.
    const top = window.scrollY + element.getBoundingClientRect().top;
    const travel = element.offsetHeight - window.innerHeight;
    window.scrollTo({
      top: top + ((index + 0.5) / STATES) * travel,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  return (
    <div ref={track} className="lg:h-[340svh]">
      <div className="grid grid-cols-1 gap-10 lg:sticky lg:top-0 lg:h-svh lg:grid-cols-12 lg:items-center lg:gap-12 lg:py-10">
        <div className="lg:col-span-5">
          <h2 className="text-[clamp(2rem,4vw,2.75rem)] leading-[1.02] font-extrabold tracking-[-0.03em] text-balance">
            {t("looksHeading")}
          </h2>
          <p className="mt-4 max-w-[44ch] text-muted-foreground">
            {t("looksBody")}
          </p>
          <div className="mt-8">
            <LandingLooksList
              active={active}
              onSelect={select}
              preview={preview}
            />
          </div>
        </div>
        {/* Below lg each open row draws its own page instead. */}
        <div className="max-lg:hidden lg:col-span-7">
          <LandingLooksStage preview={preview} active={active} />
        </div>
      </div>
    </div>
  );
}
