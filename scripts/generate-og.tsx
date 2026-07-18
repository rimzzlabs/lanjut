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
const MARK_SVG = `<svg width="160" height="160" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="160" rx="32" fill="#1c6b4f"/><path d="M40,28 L100,28 L120,48 L120,132 L40,132 Z" fill="#faf9f4"/><path d="M100,28 L120,48 L100,48 Z" fill="#bfe3de"/><rect x="54" y="66" width="52" height="8" rx="4" fill="#1c6b4f"/><rect x="54" y="86" width="38" height="8" rx="4" fill="#9dccbf"/><path d="M54,108 L76,118 L54,128" fill="none" stroke="#1c6b4f" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const MARK_SRC = `data:image/svg+xml;base64,${Buffer.from(MARK_SVG).toString("base64")}`;

const fraunces = readFileSync(join(ROOT, "scripts/fraunces-semibold.ttf"));

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
          <span style={{ fontSize: 84, letterSpacing: "-2px" }}>Lanjut</span>
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
