import { A } from "@mobily/ts-belt";
import { useTranslations } from "use-intl";
import {
  type IslandProps,
  IslandProviders,
} from "@/components/shared/providers";
import { type LandingRead, useLandingReadStore } from "@/lib/store";

/** The first lines of the hero's PDF as the extractor returned them. */
export function LandingReadSnippet(props: IslandProps) {
  return (
    <IslandProviders locale={props.locale} pathname={props.pathname}>
      <LandingReadSnippetBody />
    </IslandProviders>
  );
}

function LandingReadSnippetBody() {
  const t = useTranslations("landing");
  const read = useLandingReadStore((state) => state.read);
  const report = snippetReport(read);
  const lines = report ? A.take(report.lines, 4) : [];

  return (
    <div className="rounded-3xl bg-(--ink) p-5 font-machine text-xs leading-[1.8]">
      <p className="mb-2 flex justify-between gap-3 text-(--machine-muted)">
        <span>{t("snippetLabel")}</span>
        {report && (
          <span className="tabular-nums">
            {t("snippetChars", { chars: report.chars })}
          </span>
        )}
      </p>
      {lines.map((line, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: extracted lines repeat; their position is their identity
        <p key={index} className="truncate text-(--machine)">
          {line}
        </p>
      ))}
      {!report && <p className="text-(--machine-muted)">{t("reading")}</p>}
    </div>
  );
}

function snippetReport(read: LandingRead) {
  if (read.status === "done") return read.report;
  if (read.status === "reading") return read.last;
  return null;
}
