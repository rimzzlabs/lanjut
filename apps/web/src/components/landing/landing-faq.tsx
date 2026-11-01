import { type Locale, localizePath } from "@lanjut/i18n/routing";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@lanjut/ui/components/accordion";
import { useLocale, useTranslations } from "use-intl";
import { IslandProviders } from "@/components/shared/island-providers";
import type { IslandProps } from "@/components/shared/providers";
import { type GuideSlug, guidePath } from "@/lib/guides";
import { FAQ_KEYS, type FaqKey } from "./landing-faq-keys";

// The answers that a guide covers in full.
const FAQ_GUIDES: Partial<Record<FaqKey, GuideSlug>> = {
  ats: "how-to-make-an-ats-resume",
};

/** The questions people have before they start, answered from what ships. */
export function LandingFaq(props: IslandProps) {
  return (
    <IslandProviders locale={props.locale} pathname={props.pathname}>
      <LandingFaqList />
    </IslandProviders>
  );
}

function LandingFaqList() {
  return (
    <Accordion className="rounded-xl">
      {FAQ_KEYS.map((key) => (
        <LandingFaqItem key={key} id={key} />
      ))}
    </Accordion>
  );
}

function LandingFaqItem(props: { id: FaqKey }) {
  const t = useTranslations("landing");

  return (
    <AccordionItem value={props.id}>
      <AccordionTrigger className="px-5 py-5 text-base font-semibold hover:no-underline md:px-6">
        {t(`faq.${props.id}.question`)}
      </AccordionTrigger>
      <AccordionContent
        hiddenUntilFound
        className="max-w-[62ch] px-1 pb-5 text-base text-muted-foreground md:px-2"
      >
        <p>{t(`faq.${props.id}.answer`)}</p>
        <LandingFaqGuideLink id={props.id} />
      </AccordionContent>
    </AccordionItem>
  );
}

function LandingFaqGuideLink(props: { id: FaqKey }) {
  const t = useTranslations("landing");
  const locale = useLocale();
  const slug = FAQ_GUIDES[props.id];
  if (!slug) return null;

  return (
    <a
      href={localizePath(guidePath(slug), locale as Locale)}
      className="mt-3 inline-block text-sm rounded-xs text-foreground underline underline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {t("faq.guideLink")}
    </a>
  );
}
