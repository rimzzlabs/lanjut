import { Image } from "@react-pdf/renderer";
import type { HeaderView } from "../resume-preview";

/** Preview px to PDF pt, matching the type scale used across the templates. */
const PDF_SCALE = 0.75;

/**
 * The opt-in portrait for PDF headers. Renders nothing without a photo, so
 * photo-free documents lay out exactly as before. Size and corner radius are
 * the document's presentation tokens. Drawn as an image, never absolutely
 * positioned, so it cannot disturb text extraction order.
 */
export function PdfHeaderPhoto(props: {
  header: Pick<
    HeaderView,
    "photo" | "photoSize" | "photoRadius" | "photoAlign"
  >;
  centered?: boolean;
}) {
  const { photo, photoSize, photoRadius, photoAlign } = props.header;
  if (!photo) return null;
  const size = photoSize * PDF_SCALE;
  return (
    <Image
      src={photo}
      style={{
        width: size,
        height: size,
        borderRadius: (size * photoRadius) / 100,
        alignSelf: (
          { top: "flex-start", center: "center", bottom: "flex-end" } as const
        )[photoAlign],
        ...(props.centered
          ? { alignSelf: "center", marginBottom: 6 }
          : undefined),
      }}
    />
  );
}
