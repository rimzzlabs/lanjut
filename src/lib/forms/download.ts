import { z } from "zod";

type Translator = (key: string) => string;

export function createDownloadFileSchema(t: Translator) {
  return z.object({
    format: z.enum(["pdf", "docx", "txt"]),
    fileName: z.string().trim().min(1, t("fileNameRequired")),
  });
}

export type DownloadFileForm = z.infer<
  ReturnType<typeof createDownloadFileSchema>
>;
