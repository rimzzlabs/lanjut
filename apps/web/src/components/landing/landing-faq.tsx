import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@lanjut/ui/components/accordion";
import { useTranslations } from "use-intl";
import {
  type IslandProps,
  IslandProviders,
} from "@/components/shared/providers";

const FAQ_KEYS = [
  "free",
  "storage",
  "files",
  "ats",
  "import",
  "language",
  "photo",
] as const;

type FaqKey = (typeof FAQ_KEYS)[number];

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
      </AccordionContent>
    </AccordionItem>
  );
}
