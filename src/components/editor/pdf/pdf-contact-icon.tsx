import { Circle, Path, Rect, Svg } from "@react-pdf/renderer";
import type { ContactKind } from "../resume-preview";
import { PDF_COLORS } from "./pdf-fonts";

const ICON = {
  stroke: PDF_COLORS.muted,
  strokeWidth: 2,
  fill: "none",
} as const;

/** lucide-equivalent contact glyphs, drawn as vector SVG (not text). */
export function PdfContactIcon(props: { kind: ContactKind }) {
  switch (props.kind) {
    case "phone":
      return (
        <Svg width={8} height={8} viewBox="0 0 24 24">
          <Path
            {...ICON}
            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
          />
        </Svg>
      );
    case "email":
      return (
        <Svg width={8} height={8} viewBox="0 0 24 24">
          <Rect {...ICON} x={2} y={4} width={20} height={16} rx={2} />
          <Path {...ICON} d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </Svg>
      );
    case "website":
      return (
        <Svg width={8} height={8} viewBox="0 0 24 24">
          <Circle {...ICON} cx={12} cy={12} r={10} />
          <Path {...ICON} d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <Path {...ICON} d="M2 12h20" />
        </Svg>
      );
    case "location":
      return (
        <Svg width={8} height={8} viewBox="0 0 24 24">
          <Path
            {...ICON}
            d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
          />
          <Circle {...ICON} cx={12} cy={10} r={3} />
        </Svg>
      );
  }
}
