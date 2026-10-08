# /// script
# dependencies = ["fonttools"]
# ///
"""Builds public/fonts/SquareBullet.ttf, the font Luasa's PDF bullets use.

Run from apps/web: uv run scripts/build-square-bullet-font.py

No résumé font has a square glyph. This font draws "•" (U+2022) as a square,
so the PDF marker stays visible text that parsers read as a bullet. See
SQUARE_BULLET_FAMILY in src/components/editor/takumi/takumi-fonts.ts.
"""

from pathlib import Path

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

OUTPUT = Path(__file__).resolve().parent.parent / "public/fonts/SquareBullet.ttf"

UNITS_PER_EM = 1000
# Inter's "•" advance (0.5625em), so the square takes the bullet's place.
ADVANCE = 563
# 4px at the 12px résumé body size, the square `list-[square]` draws.
SIDE = 333
CENTER_X = 281
CENTER_Y = 320
LEFT = CENTER_X - SIDE // 2
BOTTOM = CENTER_Y - SIDE // 2


def square_glyph():
    pen = TTGlyphPen(None)
    pen.moveTo((LEFT, BOTTOM))
    pen.lineTo((LEFT, BOTTOM + SIDE))
    pen.lineTo((LEFT + SIDE, BOTTOM + SIDE))
    pen.lineTo((LEFT + SIDE, BOTTOM))
    pen.closePath()
    return pen.glyph()


def empty_glyph():
    return TTGlyphPen(None).glyph()


def main():
    builder = FontBuilder(UNITS_PER_EM, isTTF=True)
    builder.setupGlyphOrder([".notdef", "space", "bullet"])
    # The space glyph matters: without one, the shaper folds the invisible
    # direction mark takumi-pdf adds into the bullet, and it extracts with it.
    builder.setupCharacterMap({0x20: "space", 0x2022: "bullet"})
    builder.setupGlyf(
        {".notdef": empty_glyph(), "space": empty_glyph(), "bullet": square_glyph()}
    )
    builder.setupHorizontalMetrics(
        {".notdef": (ADVANCE, 0), "space": (250, 0), "bullet": (ADVANCE, LEFT)}
    )
    builder.setupHorizontalHeader(ascent=800, descent=-200)
    builder.setupNameTable(
        {
            "familyName": "Square Bullet",
            "styleName": "Regular",
            "psName": "SquareBullet-Regular",
        }
    )
    builder.setupOS2(
        sTypoAscender=800,
        sTypoDescender=-200,
        sTypoLineGap=0,
        usWinAscent=800,
        usWinDescent=200,
        sxHeight=500,
        sCapHeight=700,
    )
    builder.setupPost()
    builder.save(OUTPUT)


if __name__ == "__main__":
    main()
