import { A } from "@mobily/ts-belt";
import { z } from "zod";
import {
  interchangeHeaderSchema,
  interchangePhotoSchema,
} from "../interchange/schema";

export const PROFILE_BACKUP_FORMAT = "lanjut-profile";
export const PROFILE_BACKUP_VERSION = 1;

const isoDate = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "expected a date");

/** A key into the file's `photos`, so a shared photo is stored once. */
const photoRef = z.string().min(1);

/**
 * A profile backup: one profile and its résumés, for moving them to another
 * device. Each résumé is the interchange document (`interchangeSchema`)
 * beside its id and edit times, which the interchange leaves out. Objects are
 * strict, like the interchange, so a damaged file fails instead of half
 * importing.
 */
export const profileBackupSchema = z
  .strictObject({
    format: z.literal(PROFILE_BACKUP_FORMAT),
    version: z.literal(PROFILE_BACKUP_VERSION),
    exportedAt: isoDate,
    profile: z.strictObject({
      id: z.string().min(1),
      // The profile form's own limit.
      name: z.string().max(60),
      createdAt: isoDate,
      updatedAt: isoDate,
      header: interchangeHeaderSchema.optional(),
      photo: photoRef.optional(),
      summary: z.string().optional(),
    }),
    photos: z.record(z.string(), interchangePhotoSchema).optional(),
    resumes: z.array(
      z.strictObject({
        id: z.string().min(1),
        createdAt: isoDate,
        updatedAt: isoDate,
        photo: photoRef.optional(),
        resume: z.record(z.string(), z.unknown()),
      }),
    ),
  })
  .superRefine((value, ctx) => {
    const seen = new Set<string>();
    A.forEachWithIndex(value.resumes, (index, item) => {
      if (seen.has(item.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["resumes", index, "id"],
          message: "a resume id appears twice",
        });
      }
      seen.add(item.id);
    });
  });

export type ProfileBackupFile = z.infer<typeof profileBackupSchema>;
