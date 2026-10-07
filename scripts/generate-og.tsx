/**
 * Build-time Open Graph image generator.
 *
 * Runs on the build machine before every web build. Satori lays the card out
 * as SVG and sharp rasterizes it. Emits one PNG per locale to public/og/,
 * which the root layout references. Re-run after any brand change:
 *   pnpm generate:og
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import satori from "satori";
import sharp from "sharp";
import { routing } from "../src/i18n/routing";

interface Messages {
  landing: {
    headingLine1: string;
    headingLead: string;
    headingAccent: string;
    ogLine: string;
  };
  platform: { sidebar: { tagline: string } };
}

const ROOT = process.cwd();
const SIZE = { width: 1200, height: 630 };

const PAPER = "#faf9f4";
const INK = "#1b211e";
const MUTED = "#6b7b71";
const ACCENT = "#1c6b4f";

// Evergreen recolour of public/favicon.svg, inlined so satori can render it.
const MARK_SVG = `<svg width="160" height="160" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="tile"><circle cx="32" cy="32" r="32"/></clipPath></defs><circle cx="32" cy="32" r="32" fill="#1c6b4f"/><g clip-path="url(#tile)"><path d="M14 18 H42 C51 18 51 32 42 32 H22 C13 32 13 46 22 46 H72" fill="none" stroke="#faf9f4" stroke-width="6.5" stroke-linecap="round"/></g></svg>`;
const MARK_SRC = `data:image/svg+xml;base64,${Buffer.from(MARK_SVG).toString("base64")}`;

const fraunces = readFileSync(join(ROOT, "scripts/fraunces-semibold.ttf"));
const jakarta = readFileSync(join(ROOT, "scripts/plus-jakarta-sans-bold.ttf"));

function readMessages(locale: string): Messages {
  return JSON.parse(
    readFileSync(join(ROOT, "messages", `${locale}.json`), "utf8"),
  );
}

function OgImage(props: { messages: Messages }) {
  const { landing, platform } = props.messages;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "84px",
        background: PAPER,
        color: INK,
        fontFamily: "Fraunces",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <img src={MARK_SRC} width={92} height={92} alt="" />
          <span
            style={{
              fontFamily: "PlusJakartaSans",
              fontWeight: 700,
              fontSize: 80,
              letterSpacing: "-2px",
            }}
          >
            Lanjut
          </span>
        </div>
        <span
          style={{
            marginTop: "20px",
            fontSize: 26,
            letterSpacing: "6px",
            textTransform: "uppercase",
            color: MUTED,
          }}
        >
          {platform.sidebar.tagline}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 62, lineHeight: 1.05, maxWidth: "920px" }}>
          {landing.headingLine1} {landing.headingLead}
          {landing.headingAccent}
        </span>
        <div
          style={{
            width: "72px",
            height: "4px",
            marginTop: "36px",
            marginBottom: "24px",
            background: ACCENT,
          }}
        />
        <span
          style={{
            fontSize: 24,
            letterSpacing: "5px",
            textTransform: "uppercase",
            color: ACCENT,
          }}
        >
          {landing.ogLine}
        </span>
      </div>
    </div>
  );
}

async function main() {
  const outDir = join(ROOT, "public", "og");
  mkdirSync(outDir, { recursive: true });

  for (const locale of routing.locales) {
    const messages = readMessages(locale);
    const svg = await satori(<OgImage messages={messages} />, {
      ...SIZE,
      fonts: [
        { name: "Fraunces", data: fraunces, weight: 600, style: "normal" },
        {
          name: "PlusJakartaSans",
          data: jakarta,
          weight: 700,
          style: "normal",
        },
      ],
    });
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    writeFileSync(join(outDir, `${locale}.png`), png);
    console.log(
      `  ✓ public/og/${locale}.png (${(png.length / 1024).toFixed(1)} KiB)`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
