import { A, D, G, O, pipe, S } from "@mobily/ts-belt";
import { parseAsString, useQueryStates } from "nuqs";
import {
  FEEDBACK_AREAS,
  FEEDBACK_KINDS,
  type FeedbackArea,
  type FeedbackDetails,
  type FeedbackKind,
} from "@/lib/feedback/feedback-schema";

const PARAM_MAX_LENGTH = 60;

// Desktop builds up to 0.19 open the page with the old names: `feature`, the
// old area labels, and one free-text `client` string.
const LEGACY_KINDS: Record<string, FeedbackKind> = { feature: "idea" };
const LEGACY_AREAS: Record<string, FeedbackArea> = {
  Editor: "editor",
  "Résumé preview": "preview",
  Templates: "templates",
  "Export (PDF / DOCX / TXT)": "pdf",
  "Dashboard / library": "library",
  "Landing page": "home",
  Other: "other",
};

const PARAMS = {
  kind: parseAsString,
  area: parseAsString,
  app: parseAsString,
  os: parseAsString,
  template: parseAsString,
  font: parseAsString,
  doclang: parseAsString,
  client: parseAsString,
};

function clean(value: string | null): string | undefined {
  if (value === null) return undefined;
  const trimmed = pipe(value, S.trim, S.slice(0, PARAM_MAX_LENGTH));
  return S.isEmpty(trimmed) ? undefined : trimmed;
}

function kindOf(value: string | undefined): FeedbackKind | undefined {
  if (value === undefined) return undefined;
  if (G.isString(LEGACY_KINDS[value])) return LEGACY_KINDS[value];
  return pipe(
    FEEDBACK_KINDS,
    A.find((kind) => kind === value),
    O.toUndefined,
  );
}

function areaOf(value: string | undefined): FeedbackArea | undefined {
  if (value === undefined) return undefined;
  if (G.isString(LEGACY_AREAS[value])) return LEGACY_AREAS[value];
  return pipe(
    FEEDBACK_AREAS,
    A.find((area) => area === value),
    O.toUndefined,
  );
}

/** The build and system the desktop app named, from new or legacy params. */
function desktopDetails(
  app: string | undefined,
  os: string | undefined,
  client: string | undefined,
): FeedbackDetails {
  if (app !== undefined) return { app, os, platform: "Mac app" };
  if (client === undefined || !S.startsWith(client, "desktop ")) return {};
  const [, version, ...system] = S.split(client, " ");
  return {
    app: version,
    os: clean(A.join(system, " ")),
    platform: "Mac app",
  };
}

export interface FeedbackLaunch {
  kind: FeedbackKind | undefined;
  area: FeedbackArea | undefined;
  /** What the opener knew that this page cannot see, such as the desktop build. */
  details: FeedbackDetails;
  fromDesktop: boolean;
}

/**
 * What the /feedback page was opened with. The desktop app opens it in a
 * window and names the kind, the area, its build and system, and the open
 * résumé's look, since this page cannot see the app it was opened from.
 */
export function useFeedbackLaunch(): FeedbackLaunch {
  const [params] = useQueryStates(PARAMS);
  const desktop = desktopDetails(
    clean(params.app),
    clean(params.os),
    clean(params.client),
  );
  const resume: FeedbackDetails = {
    template: clean(params.template),
    font: clean(params.font),
    documentLanguage: clean(params.doclang),
  };

  return {
    kind: kindOf(clean(params.kind)),
    area: areaOf(clean(params.area)),
    details: pipe(
      { ...desktop, ...resume },
      D.filter((value) => O.isSome(value)),
    ),
    fromDesktop: desktop.platform !== undefined,
  };
}
