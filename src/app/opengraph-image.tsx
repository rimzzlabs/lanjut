import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt =
  "Lanjut — free, local-first résumé builder that sails through applicant tracking systems";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TEAL = "#1f7a70";
const INK = "#241f1c";
const MUTED = "#8a7c74";

/** The logomark from public/lanjut_logo.svg, redrawn at the mark's own 160×160 viewBox. */
function Logomark() {
  return (
    <svg
      width="220"
      height="220"
      viewBox="0 0 160 160"
      role="img"
      aria-label="Lanjut logomark"
    >
      <rect x="8" y="8" width="144" height="144" rx="32" fill={TEAL} />
      <path d="M44,32 L100,32 L116,48 L116,128 L44,128 Z" fill="#ffffff" />
      <path d="M100,32 L116,48 L100,48 Z" fill="#c9e9e4" />
      <rect x="56" y="64" width="48" height="6" rx="3" fill={TEAL} />
      <rect x="56" y="80" width="36" height="6" rx="3" fill="#bfe3de" />
      <path
        d="M56,100 L74,108 L56,116"
        fill="none"
        stroke={TEAL}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function Image() {
  const [interSemiBold, interBold] = await Promise.all([
    readFile(join(process.cwd(), "public/fonts/Inter-SemiBold.ttf")),
    readFile(join(process.cwd(), "public/fonts/Inter-Bold.ttf")),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        backgroundImage:
          "radial-gradient(circle, rgba(31, 122, 112, 0.10) 2px, transparent 2px)",
        backgroundSize: "28px 28px",
        fontFamily: "Inter",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
        <Logomark />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 120, fontWeight: 700, color: INK }}>
            Lanjut
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: 10,
              color: MUTED,
            }}
          >
            RÉSUMÉ ATS PLATFORM
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 56,
          fontSize: 36,
          fontWeight: 600,
          color: "#57534e",
        }}
      >
        Land the interview, not the reject pile.
      </div>

      <div
        style={{
          marginTop: 24,
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: 3,
          color: TEAL,
        }}
      >
        FREE · OPEN SOURCE · LOCAL-FIRST
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Inter", data: interSemiBold, style: "normal", weight: 600 },
        { name: "Inter", data: interBold, style: "normal", weight: 700 },
      ],
    },
  );
}
