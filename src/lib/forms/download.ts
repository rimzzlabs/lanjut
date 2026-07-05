import { z } from "zod";

export const downloadFileSchema = z.object({
  format: z.enum(["pdf", "docx", "txt"]),
  fileName: z.string().trim().min(1, "Name the file before downloading."),
});

export type DownloadFileForm = z.infer<typeof downloadFileSchema>;
