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

// Every template falls back to these three; resumeTypographyStyle names them.
const DEFAULT_FAMILIES: ReadonlyArray<string> = ["Inter", "Lora", "GeistMono"];

interface FontLoader {
  key: string;
  name: string;
  weight: number;
  style: "normal" | "italic";
  data: () => Promise<Uint8Array>;
}

interface ResumeFontLoadersParams {
  fontId: string | undefined;
  readFile: ReadFontFile;
}

/**
 * Lazy font loaders for the families a résumé can draw with: the three
 * defaults and the chosen override. Each face registers under the CSS family
 * name the preview uses, keyed by file so faces of one family stay distinct.
 */
export function resumeFontLoaders(
  params: ResumeFontLoadersParams,
): ReadonlyArray<FontLoader> {
  const { fontId, readFile } = params;
  const override = resolveFont(fontId);
  const families = pipe(
    DEFAULT_FAMILIES,
    A.concat(override ? [override.family] : []),
    A.uniq,
  );
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
