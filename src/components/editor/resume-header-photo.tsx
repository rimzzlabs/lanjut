import Image from "next/image";
import { cn } from "@/lib/utils";
import type { HeaderView } from "./resume-preview";

/**
 * The opt-in portrait, shared by every template header. Renders nothing when
 * the document has no photo, so photo-free resumes lay out exactly as before.
 * Size and corner radius are the document's presentation tokens; uploads are
 * pre-cropped square, so object-cover never has to crop here.
 */
export function ResumeHeaderPhoto(props: {
  header: Pick<
    HeaderView,
    "photo" | "photoSize" | "photoRadius" | "photoAlign"
  >;
  className?: string;
}) {
  const { photo, photoSize, photoRadius, photoAlign } = props.header;
  if (!photo) return null;
  return (
    <Image
      src={photo}
      alt=""
      width={photoSize}
      height={photoSize}
      unoptimized
      className={cn("shrink-0 object-cover", props.className)}
      style={{
        width: photoSize,
        height: photoSize,
        borderRadius: `${photoRadius}%`,
        alignSelf: { top: "flex-start", center: "center", bottom: "flex-end" }[
          photoAlign
        ],
      }}
    />
  );
}
