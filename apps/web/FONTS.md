# Fonts

Every font that Lanjut ships uses the SIL Open Font License 1.1 (OFL), except Square Bullet. Square Bullet is part of this project and uses its AGPL-3.0 license.

[`public/fonts/OFL.txt`](public/fonts/OFL.txt) holds the OFL text and the copyright notice of each OFL family on this page. The build copies it to `/fonts/OFL.txt`, beside the résumé fonts.

## Résumé fonts

`public/fonts/` holds the fonts that a résumé can use, and `FONTS` in `src/lib/fonts.ts` lists them. The editor preview and the PDF export load the same files. The PDF export embeds only the glyphs that a résumé uses.

Each family has Regular, Italic, Bold, and Bold Italic, except Geist Mono, which has Regular and Bold only. The SemiBold column shows the families that also have a SemiBold.

### Families with a Reserved Font Name

Six families reserve their name under the OFL. The OFL FAQ (2.6 to 2.8) counts a cut-down copy of a font as a Modified Version. A Modified Version must not use a Reserved Font Name.

Lanjut therefore ships these six families as the unmodified upstream files, with the full character set. Each file is byte-identical to the file at the linked source. Some files have a new file name to match the `<Prefix>-<Variant>.ttf` pattern.

| Family         | SemiBold | Version | Source                                                                                                                                                     | Reserved Font Name |
| -------------- | -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Carlito        | No       | 1.104   | [googlefonts/carlito `fonts/ttf`](https://github.com/googlefonts/carlito/tree/3a810cab78ebd6e2e4eed42af9e8453c4f9b850a/fonts/ttf)                          | "Carlito"          |
| IBM Plex Mono  | Yes      | 2.005   | [IBM/plex `plex-mono/fonts/complete/ttf`](https://github.com/IBM/plex/tree/763c36ef9117782905ae010056dfbe8fd2653a25/packages/plex-mono/fonts/complete/ttf) | "Plex"             |
| Lora           | No       | 3.021   | [cyrealtype/Lora-Cyrillic `fonts/ttf`](https://github.com/cyrealtype/Lora-Cyrillic/tree/2d53b449b60e185b39f671b44fded83e0910ad30/fonts/ttf)                | "Lora"             |
| Merriweather   | No       | 2.002   | [google/fonts `ofl/merriweather`](https://github.com/google/fonts/tree/e9263a54d43d89ddcf351c5ae8ab2179f1aebc89/ofl/merriweather)                          | "Merriweather"     |
| Source Sans 3  | Yes      | 3.052   | [adobe-fonts/source-sans `TTF`](https://github.com/adobe-fonts/source-sans/tree/87b37a2daaed80fcb8e8ccb0085c4d72ddade12e/TTF)                              | "Source"           |
| Source Serif 4 | Yes      | 4.005   | [adobe-fonts/source-serif `TTF`](https://github.com/adobe-fonts/source-serif/tree/80d3f8894c09c937bebfa9011247d2e1c79fd6f4/TTF)                            | "Source"           |

Merriweather is version 2.002, the last release with static files. Merriweather 4 ships only as a variable font of 4.6 MB per style. Version 2.002 has no SemiBold, so semibold text in Merriweather uses the nearest weight.

### Other families

These nine families have no Reserved Font Name. Each file is a static TTF from Google Fonts, cut to the Latin, Latin Extended, and Cyrillic characters that the family has. `scripts/build-resume-fonts.py` makes the cut. Courier Prime has no Cyrillic, so the PDF export draws Cyrillic letters in it with Inter: takumi-pdf takes a glyph that a face lacks from another loaded face.

To rebuild these files, for example after a new upstream version, run the script from `apps/web` with [uv](https://docs.astral.sh/uv/). `--check` reports and writes nothing. The script refuses to write a face whose existing characters change width, because that would move the text of résumés that already exist.

```sh
uv run scripts/build-resume-fonts.py --check
uv run scripts/build-resume-fonts.py
```

| Family         | SemiBold | Version | Upstream project                                                                  |
| -------------- | -------- | ------- | --------------------------------------------------------------------------------- |
| Arimo          | Yes      | 1.341   | [googlefonts/arimo](https://github.com/googlefonts/arimo)                         |
| Courier Prime  | No       | 3.018   | [quoteunquoteapps/CourierPrime](https://github.com/quoteunquoteapps/CourierPrime) |
| EB Garamond    | Yes      | 1.003   | [octaviopardo/EBGaramond12](https://github.com/octaviopardo/EBGaramond12)         |
| Geist Mono     | No       | 1.700   | [vercel/geist-font](https://github.com/vercel/geist-font)                         |
| Inter          | Yes      | 4.001   | [rsms/inter](https://github.com/rsms/inter)                                       |
| JetBrains Mono | Yes      | 2.211   | [JetBrains/JetBrainsMono](https://github.com/JetBrains/JetBrainsMono)             |
| Open Sans      | Yes      | 3.003   | [googlefonts/opensans](https://github.com/googlefonts/opensans)                   |
| Roboto         | Yes      | 3.015   | [googlefonts/roboto-classic](https://github.com/googlefonts/roboto-classic)       |
| Tinos          | No       | 1.340   | [googlefonts/tinos](https://github.com/googlefonts/tinos)                         |

### Square Bullet

`SquareBullet.ttf` holds one visible glyph: the bullet "•" (U+2022), drawn as a square. No résumé font has a square glyph, so the PDF export sets square list markers in this font. The marker then stays text that a parser reads as a bullet.

`scripts/build-square-bullet-font.py` draws the font. If you change the square, run the script from `apps/web` with [uv](https://docs.astral.sh/uv/):

```sh
uv run scripts/build-square-bullet-font.py
```

## Interface fonts

`astro.config.ts` declares seven Google Fonts families through the Astro font API. At build time, Astro downloads the Latin subset of each family and serves it from `/_astro/fonts/`. The repository does not hold these files. None of these families has a Reserved Font Name.

| Family            | CSS variable        | Upstream project                                                              |
| ----------------- | ------------------- | ----------------------------------------------------------------------------- |
| Inter             | `--font-sans`       | [rsms/inter](https://github.com/rsms/inter)                                   |
| Geist             | `--font-geist-sans` | [vercel/geist-font](https://github.com/vercel/geist-font)                     |
| Geist Mono        | `--font-geist-mono` | [vercel/geist-font](https://github.com/vercel/geist-font)                     |
| Plus Jakarta Sans | `--font-brand`      | [tokotype/PlusJakartaSans](https://github.com/tokotype/PlusJakartaSans)       |
| Schibsted Grotesk | `--font-landing`    | [schibsted/schibsted-grotesk](https://github.com/schibsted/schibsted-grotesk) |
| Martian Mono      | `--font-machine`    | [evilmartians/mono](https://github.com/evilmartians/mono)                     |
| Fraunces          | `--font-display`    | [undercasetype/Fraunces](https://github.com/undercasetype/Fraunces)           |

`public/brand/plus-jakarta-sans-700.woff2` is a Latin subset of Plus Jakarta Sans Bold, version 2.071. The desktop splash window (`public/splashscreen.html`) uses it.

## Add a résumé font

1. Put the static TTF files in `public/fonts/`. Name them `<Prefix>-<Variant>.ttf`, the names that `faceSet` in `src/lib/fonts.ts` expects.
   If the family has a Reserved Font Name, use the unmodified upstream files. Do not subset or convert them.
   Otherwise, add the family to `FAMILIES` in `scripts/build-resume-fonts.py` and run it, so the files carry Cyrillic like the others.
2. Add the family to `FontId`, `FONTS`, and `FONT_LABELS` in `src/lib/fonts.ts`.
3. Copy the copyright line from the family's own `OFL.txt` to the top of `public/fonts/OFL.txt`.
4. Add a row for the family to the correct table on this page.

If the family uses a license other than the OFL, put its license text in a separate file beside `OFL.txt`.
