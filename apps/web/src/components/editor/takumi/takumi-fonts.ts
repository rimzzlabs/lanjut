import type { TemplateId } from "@lanjut/resume/templates";
import { A, pipe } from "@mobily/ts-belt";
import { FONTS, resolveFont } from "@/lib/fonts";

/** Reads one font file from /public/fonts. The browser fetches it. */
export type ReadFontFile = (file: string) => Promise<Uint8Array>;

export async function fetchFontFile(file: string): Promise<Uint8Array> {
  const response = await fetch(`/fonts/${file}`);
  return new Uint8Array(await response.arrayBuffer());
}

/**
 * SquareBullet.ttf draws "•" (U+2022) as the 4px square that `list-[square]`
 * draws in the preview. `scripts/build-square-bullet-font.py` builds it.
 */
export const SQUARE_BULLET_FAMILY = "Square Bullet";
const SQUARE_BULLET_FILE = "SquareBullet.ttf";

// The families each template draws with when no font is chosen, as the export
// check records them (`EXPECTED_FAMILIES` in scripts/takumi-checks.ts). Inter
// is in every set: it is the fallback for anything a template leaves unset.
// Loading only these keeps Lora (about 840 KB) out of most first exports.
const TEMPLATE_FAMILIES: Record<TemplateId, ReadonlyArray<string>> = {
  awal: ["Inter"],
  ketat: ["Inter", "Lora"],
  luasa: ["Inter", "Lora"],
  tebal: ["Inter"],
  klasik: ["Inter", "Lora"],
  ketik: ["Inter", "GeistMono"],
};

interface FontLoader {
  key: string;
  name: string;
  weight: number;
  style: "normal" | "italic";
  data: () => Promise<Uint8Array>;
}

interface ResumeFontLoadersParams {
  fontId: string | undefined;
  template: TemplateId;
  readFile: ReadFontFile;
}

function resumeFamilies(
  fontId: string | undefined,
  template: TemplateId,
): ReadonlyArray<string> {
  const override = resolveFont(fontId);
  // A chosen font takes the sans, serif, and mono slots alike
  // (resumeTypographyStyle), so it needs only itself and the fallback.
  if (override) return A.uniq([override.family, "Inter"]);
  return TEMPLATE_FAMILIES[template];
}

/**
 * Lazy font loaders for the families a résumé draws with: its template's
 * faces, or the chosen font. Each face registers under the CSS family name the
 * preview uses, keyed by file so faces of one family stay distinct.
 */
export function resumeFontLoaders(
  params: ResumeFontLoadersParams,
): ReadonlyArray<FontLoader> {
  const { fontId, template, readFile } = params;
  const families = resumeFamilies(fontId, template);
  return pipe(
    FONTS,
    A.filter((font) => A.includes(families, font.family)),
    A.flatMap((font) =>
      A.map(font.faces, (face) => ({
        key: face.file,
        name: font.family,
        weight: face.weight,
        style: face.style,
        data: () => readFile(face.file),
      })),
    ),
    A.append<FontLoader>({
      key: SQUARE_BULLET_FILE,
      name: SQUARE_BULLET_FAMILY,
      weight: 400,
      style: "normal",
      data: () => readFile(SQUARE_BULLET_FILE),
    }),
  );
}
