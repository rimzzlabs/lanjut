import { A, O, pipe, S } from "@mobily/ts-belt";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { useMemo } from "react";
import { useTranslations } from "use-intl";
import {
  type IslandProps,
  IslandProviders,
} from "@/components/shared/providers";
import {
  type LandingRead,
  useLandingDraftStore,
  useLandingReadStore,
} from "@/lib/store";
import { TEMPLATES } from "@/lib/templates";
import { draftToResume } from "./landing-draft-resume";

/** The section order a parser read from the hero's PDF; it holds for every template. */
export function LandingOrderPlate(props: IslandProps) {
  return (
    <IslandProviders locale={props.locale} pathname={props.pathname}>
      <LandingOrderPlateBody />
    </IslandProviders>
  );
}

function LandingOrderPlateBody() {
  const t = useTranslations("landing");
  const read = useLandingReadStore((state) => state.read);
  const draft = useLandingDraftStore((state) => state.draft);
  const template = useLandingDraftStore((state) => state.template);
  const titles = useMemo(
    () =>
      A.map(draftToResume(draft).sections, (section) =>
        S.toUpperCase(section.title),
      ),
    [draft],
  );
  const lines = readLines(read);
  const order = sectionOrder(lines, titles);
  const templateName = O.mapWithDefault(
    A.find(TEMPLATES, (item) => item.id === template),
    "",
    (item) => item.name,
  );

  return (
    <figure className="rounded-3xl bg-(--ink) p-5 font-machine text-xs md:p-6">
      <figcaption className="flex items-center justify-between gap-3 text-(--machine-muted)">
        <span>{t("orderTitle")}</span>
        <span className="flex items-center gap-1.5 text-(--machine)">
          {read.status === "reading" && (
            <CircleNotchIcon aria-hidden className="size-3 animate-spin" />
          )}
          {templateName}
        </span>
      </figcaption>
      <ol className="mt-4 space-y-1.5">
        {order.map((title, index) => (
          <li key={title} className="flex gap-3">
            <span className="w-5 text-(--machine-muted) tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-(--machine)">{title}</span>
          </li>
        ))}
      </ol>
      {A.isEmpty(order) && (
        <p className="mt-4 text-(--machine-muted)">{t("reading")}</p>
      )}
      <p className="mt-5 border-t border-white/10 pt-4 font-sans text-(--machine-muted)">
        {t("orderNote")}
      </p>
    </figure>
  );
}

function readLines(read: LandingRead): ReadonlyArray<string> {
  if (read.status === "done") return read.report.lines;
  if (read.status === "reading" && read.last) return read.last.lines;
  return [];
}

function sectionOrder(
  lines: ReadonlyArray<string>,
  titles: ReadonlyArray<string>,
): ReadonlyArray<string> {
  return pipe(
    lines,
    A.map((line) => S.toUpperCase(S.trim(line))),
    A.filter((line) => A.includes(titles, line)),
    A.uniq,
  );
}
