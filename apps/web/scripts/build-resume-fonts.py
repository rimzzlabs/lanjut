# /// script
# dependencies = ["fonttools"]
# ///
"""Rebuilds the résumé fonts that have no Reserved Font Name.

Run from apps/web: uv run scripts/build-resume-fonts.py [--check]

Each face is downloaded whole from Google Fonts and cut to the characters it
held before, plus Latin Extended and Cyrillic. The PDF export can draw only
the glyphs these files carry, so a letter outside them prints as nothing.
Families with a Reserved Font Name ship unmodified and are never cut (see
FONTS.md), so this script leaves them alone.

--check reports what would change and writes nothing. Without it the script
refuses to write a face whose existing characters changed width, since that
would move the text of résumés that already exist.
"""

import io
import re
import sys
import urllib.request
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

FONTS = Path(__file__).resolve().parent.parent / "public/fonts"

# File prefix: Google Fonts family.
FAMILIES = {
    "Arimo": "Arimo",
    "CourierPrime": "Courier Prime",
    "EBGaramond": "EB Garamond",
    "GeistMono": "Geist Mono",
    "Inter": "Inter",
    "JetBrainsMono": "JetBrains Mono",
    "OpenSans": "Open Sans",
    "Roboto": "Roboto",
    "Tinos": "Tinos",
}

# File suffix: (italic, weight).
STYLES = {
    "Regular": (0, 400),
    "Italic": (1, 400),
    "SemiBold": (0, 600),
    "Bold": (0, 700),
    "BoldItalic": (1, 700),
}

# An older browser gets one file with every subset instead of one per range.
USER_AGENT = "Mozilla/5.0 (Windows NT 6.1; rv:30.0) Gecko/20100101 Firefox/30.0"


def ranges(*spans):
    codepoints = set()
    for span in spans:
        start, _, end = span.partition("-")
        codepoints.update(range(int(start, 16), int(end or start, 16) + 1))
    return codepoints


# The Google Fonts "latin-ext" and "cyrillic" subsets.
LATIN_EXT = ranges(
    "0100-02BA", "02BD-02C5", "02C7-02CC", "02CE-02D7", "02DD-02FF", "0304",
    "0308", "0329", "1D00-1DBF", "1E00-1E9F", "1EF2-1EFF", "2020",
    "20A0-20AB", "20AD-20C0", "2113", "2C60-2C7F", "A720-A7FF",
)
CYRILLIC = ranges("0301", "0400-045F", "0490-0491", "04B0-04B1", "2116")


def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()


def download(family, italic, weight):
    query = f"{family.replace(' ', '+')}:ital,wght@{italic},{weight}"
    css = fetch(f"https://fonts.googleapis.com/css2?family={query}").decode()
    urls = re.findall(r"url\((https://[^)]+)\)", css)
    if len(urls) != 1:
        raise SystemExit(f"{family} {italic},{weight}: expected one file, got {len(urls)}")
    return TTFont(io.BytesIO(fetch(urls[0])))


def widths(font, codepoints):
    cmap = font.getBestCmap()
    metrics = font["hmtx"].metrics
    return {cp: metrics[cmap[cp]][0] for cp in codepoints if cp in cmap}


def main():
    check = "--check" in sys.argv
    drifted = []
    for prefix, family in FAMILIES.items():
        for suffix, (italic, weight) in STYLES.items():
            path = FONTS / f"{prefix}-{suffix}.ttf"
            if not path.exists():
                continue
            current = TTFont(path)
            kept = set(current.getBestCmap())
            source = download(family, italic, weight)
            available = set(source.getBestCmap())

            before = widths(current, kept)
            after = widths(source, kept)
            changed = [cp for cp in before if after.get(cp) != before[cp]]
            if changed:
                drifted.append(path.name)

            wanted = (kept | LATIN_EXT | CYRILLIC) & available
            cyrillic = len(CYRILLIC & available)
            print(
                f"{path.name}: {len(kept)} -> {len(wanted)} characters, "
                f"Cyrillic {cyrillic}/{len(CYRILLIC)}, "
                f"{len(changed)} widths changed"
            )
            if check or changed:
                continue

            options = subset.Options()
            options.layout_features = ["*"]
            options.name_IDs = ["*"]
            options.name_languages = ["*"]
            options.notdef_outline = True
            options.glyph_names = False
            options.flavor = None
            subsetter = subset.Subsetter(options)
            subsetter.populate(unicodes=wanted)
            subsetter.subset(source)
            source.flavor = None
            source.save(path)
            print(f"  wrote {path.stat().st_size // 1024} KB")

    if drifted:
        raise SystemExit(f"widths changed, nothing written for: {', '.join(drifted)}")


main()
