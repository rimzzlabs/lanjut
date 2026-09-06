const PHOTO_SIZE = 256;
const JPEG_QUALITY = 0.85;

/**
 * Center-crops the image to a square and downscales it to a 256px JPEG data
 * URL. The hard downscale is what keeps the stored document small: the data
 * URL lands in IndexedDB, in every undo snapshot, and in the JSON/YAML
 * interchange. A white fill first, since JPEG has no alpha and a transparent
 * PNG would otherwise composite onto black.
 */
export async function processPhotoFile(file: File): Promise<string | null> {
  if (!file.type.startsWith("image/")) return null;
  try {
    const bitmap = await createImageBitmap(file);
    const side = Math.min(bitmap.width, bitmap.height);
    const sx = (bitmap.width - side) / 2;
    const sy = (bitmap.height - side) / 2;
    const canvas = document.createElement("canvas");
    canvas.width = PHOTO_SIZE;
    canvas.height = PHOTO_SIZE;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, PHOTO_SIZE, PHOTO_SIZE);
    context.drawImage(bitmap, sx, sy, side, side, 0, 0, PHOTO_SIZE, PHOTO_SIZE);
    bitmap.close();
    return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  } catch {
    return null;
  }
}
