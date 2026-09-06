/**
 * Build-time Open Graph image generator.
 *
 * Runs on the build machine (never in the Worker), so next/og's satori + resvg
 * wasm stay out of the deployed bundle. Emits one PNG per locale to public/og/,
 * which the app references from generateMetadata. Re-run after any brand change:
 *   pnpm generate:og
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { routing } from "../src/i18n/routing";

type Messages = {
  hero: {
    headingLine1: string;
    headingLine2: string;
    badge: string;
    stat1Label: string;
  };
  platform: { sidebar: { tagline: string } };
};

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
  const { hero, platform } = props.messages;

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
          {/** biome-ignore lint/performance/noImgElement: satori renders a plain img */}
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
          {hero.headingLine1} {hero.headingLine2}
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
          {hero.badge} · {hero.stat1Label}
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
    const response = new ImageResponse(<OgImage messages={messages} />, {
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
    const png = Buffer.from(await response.arrayBuffer());
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
