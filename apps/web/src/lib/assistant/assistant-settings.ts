import {
  isReorderableSection,
  type Resume,
  SECTION_ORDER_PRESETS,
  type Section,
} from "@lanjut/resume";
import {
  type InterchangeResume,
  resumeToInterchange,
  validateInterchange,
} from "@lanjut/resume/interchange";
import { applyContentToResume } from "@lanjut/resume/interchange/code-edit";
import { TEMPLATES } from "@lanjut/resume/templates";
import { A, D, O, pipe, R, S } from "@mobily/ts-belt";
import type { z } from "zod";
import { FONTS } from "@/lib/fonts";
import type {
  resumeSettingsArgs,
  sectionOrderArgs,
  setPhotoArgs,
} from "./assistant-args";
import type { AssistantWindow } from "./assistant-window";
import { writeResume } from "./assistant-write";

type SettingsArgs = z.infer<typeof resumeSettingsArgs>;
type OrderArgs = z.infer<typeof sectionOrderArgs>;
type PhotoArgs = z.infer<typeof setPhotoArgs>;

const TEMPLATE_IDS: ReadonlyArray<string> = A.map(TEMPLATES, (item) => item.id);
const FONT_IDS: ReadonlyArray<string> = A.map(FONTS, (item) => item.id);

/** What `lanjut_get_resume` tells the model about the settings it can change. */
export function settingsOptions() {
  return { templates: TEMPLATE_IDS, fonts: FONT_IDS };
}

/** The sections as `lanjut_set_section_order` names them. */
export function sectionList(resume: Resume) {
  return A.map(resume.sections, (section) => ({
    id: section.id,
    type: section.type,
    title: section.title || section.type,
    hidden: section.hidden === true,
    movable: isReorderableSection(section.type),
  }));
}

function patchKey<K extends keyof InterchangeResume>(
  doc: InterchangeResume,
  key: K,
  value: InterchangeResume[K] | undefined,
): InterchangeResume {
  if (value === undefined) return doc;
  return { ...doc, [key]: value };
}

type Resettable = SettingsArgs["reset"][number];

/** A setting in `reset` goes back to the template's default. */
function resetKey(
  doc: InterchangeResume,
  reset: ReadonlyArray<Resettable>,
  setting: Resettable,
  key: keyof InterchangeResume,
): InterchangeResume {
  if (!A.includes(reset, setting)) return doc;
  return D.deleteKey(doc, key) as InterchangeResume;
}

const COLOR_PARTS = ["name", "heading", "rule", "link"] as const;

function patchColors(
  colors: InterchangeResume["colors"],
  args: SettingsArgs,
): InterchangeResume["colors"] {
  const merged = A.reduce(COLOR_PARTS, { ...(colors ?? {}) }, (acc, part) => {
    if (A.includes(args.reset, `${part}_color` as Resettable)) {
      return D.deleteKey(acc, part);
    }
    const value = args.colors?.[part];
    if (value === undefined) return acc;
    return { ...acc, [part]: S.toLowerCase(value) };
  });
  return D.isEmpty(merged) ? undefined : merged;
}

function patchSettings(
  doc: InterchangeResume,
  args: SettingsArgs,
): InterchangeResume {
  const steps: ReadonlyArray<(doc: InterchangeResume) => InterchangeResume> = [
    (next) => patchKey(next, "title", args.title),
    (next) => patchKey(next, "template", args.template),
    (next) => patchKey(next, "language", args.language),
    (next) => patchKey(next, "font", args.font),
    (next) => patchKey(next, "showIcons", args.show_icons),
    (next) => patchKey(next, "sectionSpacing", args.section_spacing),
    (next) => patchKey(next, "letterSpacing", args.letter_spacing),
    (next) => patchKey(next, "lineHeight", args.line_height),
    (next) => patchKey(next, "nameScale", args.name_scale),
    (next) => patchKey(next, "titleScale", args.title_scale),
    (next) => patchKey(next, "bodyScale", args.body_scale),
    (next) => ({ ...next, colors: patchColors(next.colors, args) }),
    (next) => resetKey(next, args.reset, "font", "font"),
    (next) => resetKey(next, args.reset, "line_height", "lineHeight"),
    (next) => resetKey(next, args.reset, "name_scale", "nameScale"),
    (next) => resetKey(next, args.reset, "title_scale", "titleScale"),
    (next) => resetKey(next, args.reset, "body_scale", "bodyScale"),
  ];
  return A.reduce(steps, doc, (acc, step) => step(acc));
}

function unknownChoice(args: SettingsArgs): O.Option<string> {
  if (args.template !== undefined && !A.includes(TEMPLATE_IDS, args.template)) {
    return O.Some(
      `Lanjut has no template "${args.template}". Use one of: ${A.join(TEMPLATE_IDS, ", ")}.`,
    );
  }
  if (args.font !== undefined && !A.includes(FONT_IDS, args.font)) {
    return O.Some(
      `Lanjut has no font "${args.font}". Use one of: ${A.join(FONT_IDS, ", ")}, or reset "font" for the template's font.`,
    );
  }
  return O.None;
}

/** The résumé with the new settings, checked by the same rules as an import. */
function withSettings(
  resume: Resume,
  args: SettingsArgs,
): R.Result<Resume, string> {
  const unknown = unknownChoice(args);
  if (O.isSome(unknown)) return R.makeError(unknown);
  const doc = resumeToInterchange(resume);
  const patched = patchSettings(doc, args);
  if (JSON.stringify(patched) === JSON.stringify(doc)) return R.makeOk(resume);
  const parsed = validateInterchange(patched);
  if (!parsed.ok) {
    const issues =
      parsed.kind === "syntax"
        ? parsed.message
        : pipe(
            parsed.issues,
            A.map((issue) => `${issue.path}: ${issue.message}`),
            A.join("; "),
          );
    return R.makeError(
      `Lanjut did not change the settings: ${issues}. The résumé did not change.`,
    );
  }
  return R.makeOk(applyContentToResume(resume, parsed.content));
}

export function updateResumeSettings(args: SettingsArgs, win: AssistantWindow) {
  return writeResume(
    {
      id: args.id,
      baseRevision: args.base_revision,
      next: (resume) => Promise.resolve(withSettings(resume, args)),
    },
    win,
  );
}

// --- Section order ----------------------------------------------------------

function presetOrder(
  sections: ReadonlyArray<Section>,
  preset: keyof typeof SECTION_ORDER_PRESETS,
): ReadonlyArray<Section> {
  const order: ReadonlyArray<string> = SECTION_ORDER_PRESETS[preset];
  const rank = (section: Section) =>
    O.getWithDefault(
      A.getIndexBy(order, (type) => type === section.type),
      A.length(order),
    );
  return A.sort(sections, (a, b) => rank(a) - rank(b));
}

/**
 * The movable sections in the order that the call names, in the slots that
 * movable sections hold now. A pinned section (the summary) keeps its slot.
 */
function exactOrder(
  sections: ReadonlyArray<Section>,
  ids: ReadonlyArray<string>,
): R.Result<ReadonlyArray<Section>, string> {
  const movable = A.filter(sections, (section) =>
    isReorderableSection(section.type),
  );
  const movableIds = A.map(movable, (section) => section.id);
  const unique = A.uniq(ids);
  const complete =
    A.length(unique) === A.length(ids) &&
    A.length(ids) === A.length(movableIds) &&
    A.every(ids, (item) => A.includes(movableIds, item));
  if (!complete) {
    return R.makeError(
      `\`order\` must name every movable section once, and only those: ${A.join(movableIds, ", ")}. The summary stays below the header.`,
    );
  }
  const ordered = A.filterMap(ids, (item) =>
    A.find(movable, (section) => section.id === item),
  );
  const placed = A.reduce(
    sections,
    { index: 0, out: [] as ReadonlyArray<Section> },
    (acc, section) => {
      if (!isReorderableSection(section.type)) {
        return { ...acc, out: A.append(acc.out, section) };
      }
      const next = O.getWithDefault(A.get(ordered, acc.index), section);
      return { index: acc.index + 1, out: A.append(acc.out, next) };
    },
  );
  return R.makeOk(placed.out);
}

function withVisibility(
  sections: ReadonlyArray<Section>,
  args: OrderArgs,
): R.Result<ReadonlyArray<Section>, string> {
  const { hidden, shown } = args;
  const known = A.map(sections, (section) => section.id);
  const unknown = A.reject(A.concat(hidden, shown), (item) =>
    A.includes(known, item),
  );
  if (!A.isEmpty(unknown)) {
    return R.makeError(
      `The résumé has no section with the id ${A.join(unknown, ", ")}. Take the ids from lanjut_get_resume.`,
    );
  }
  return R.makeOk(
    A.map(sections, (section) => {
      if (A.includes(hidden, section.id)) return { ...section, hidden: true };
      if (A.includes(shown, section.id)) return { ...section, hidden: false };
      return section;
    }),
  );
}

function sameSections(
  a: ReadonlyArray<Section>,
  b: ReadonlyArray<Section>,
): boolean {
  return (
    A.length(a) === A.length(b) &&
    A.every(A.zip(a, b), ([left, right]) => left === right)
  );
}

function withOrder(resume: Resume, args: OrderArgs): R.Result<Resume, string> {
  if (args.preset && args.order) {
    return R.makeError("Give `preset` or `order`, not both.");
  }
  const ordered = args.order
    ? exactOrder(resume.sections, args.order)
    : R.makeOk<ReadonlyArray<Section>, string>(
        args.preset
          ? presetOrder(resume.sections, args.preset)
          : resume.sections,
      );
  return pipe(
    ordered,
    R.flatMap((sections) => withVisibility(sections, args)),
    R.map((sections) =>
      sameSections(sections, resume.sections)
        ? resume
        : { ...resume, sections },
    ),
  );
}

export function setSectionOrder(args: OrderArgs, win: AssistantWindow) {
  return writeResume(
    {
      id: args.id,
      baseRevision: args.base_revision,
      next: (resume) => Promise.resolve(withOrder(resume, args)),
    },
    win,
  );
}

// --- Photo ------------------------------------------------------------------

function photoFile(image: NonNullable<PhotoArgs["image"]>): File {
  const binary = atob(image.base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new File([bytes], "photo", { type: image.mime });
}

async function withPhoto(
  resume: Resume,
  image: PhotoArgs["image"],
): Promise<R.Result<Resume, string>> {
  if (image === null) {
    if (!resume.header.photo) return R.makeOk(resume);
    return R.makeOk({
      ...resume,
      header: D.deleteKey(resume.header, "photo"),
    });
  }
  const { processPhotoFile } = await import(
    "@/components/editor/editor-sections/ed-section-personal/photo-process"
  );
  const photo = await processPhotoFile(photoFile(image));
  if (!photo) {
    return R.makeError(
      "Lanjut could not read that image. Use a JPEG, PNG, WebP, or GIF file.",
    );
  }
  return R.makeOk({ ...resume, header: { ...resume.header, photo } });
}

export function setPhoto(args: PhotoArgs, win: AssistantWindow) {
  return writeResume(
    {
      id: args.id,
      baseRevision: args.base_revision,
      next: (resume) => withPhoto(resume, args.image),
    },
    win,
  );
}
