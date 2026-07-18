import { z } from "zod";
import {
  CUSTOM_LIST_FIELDS,
  type FieldSchema,
  HEADER_SCHEMA,
  SECTION_REGISTRY,
  type SectionType,
} from "@/lib/resume";

export const INTERCHANGE_FORMAT = "lanjut-resume";
export const INTERCHANGE_VERSION = 1;

/**
 * The human-editable interchange shape shared by every serialization (JSON now,
 * YAML later). Rich text fields are strings in the interchange markdown dialect
 * (see markdown.ts); field keys come straight from the schema registry. Objects
 * are strict so a typo'd key surfaces as an error instead of vanishing.
 */

/**
 * Data fields accept bare numbers and stringify them, so a hand-typed YAML
 * scalar like `endDate: 2016` imports as the string it was meant to be.
 */
const scalarString = z
  .union([z.string(), z.number()])
  .transform((value) => String(value));

function entryShape(fields: FieldSchema[]) {
  const shape: Record<string, z.ZodOptional<typeof scalarString>> = {};
  for (const field of fields) shape[field.key] = scalarString.optional();
  return z.strictObject(shape);
}

const summarySection = z.strictObject({
  type: z.literal("summary"),
  title: z.string().optional(),
  hidden: z.boolean().optional(),
  body: scalarString.optional(),
});

function listSection<T extends SectionType>(type: T) {
  return z.strictObject({
    type: z.literal(type),
    title: z.string().optional(),
    hidden: z.boolean().optional(),
    entries: z.array(entryShape(SECTION_REGISTRY[type].fields)).optional(),
  });
}

/** Skills and Languages carry the grid's presentation-only toggles. */
function gridSection<T extends SectionType>(type: T) {
  return z.strictObject({
    type: z.literal(type),
    title: z.string().optional(),
    hidden: z.boolean().optional(),
    entries: z.array(entryShape(SECTION_REGISTRY[type].fields)).optional(),
    columns: z.union([z.literal(1), z.literal(2)]).optional(),
    showProficiency: z.boolean().optional(),
  });
}

const customSection = z.strictObject({
  type: z.literal("custom"),
  variant: z.enum(["rich", "list"]).optional(),
  title: z.string().optional(),
  hidden: z.boolean().optional(),
  body: scalarString.optional(),
  entries: z.array(entryShape(CUSTOM_LIST_FIELDS)).optional(),
});

const sectionSchema = z.discriminatedUnion("type", [
  summarySection,
  listSection("experience"),
  listSection("internship"),
  listSection("projects"),
  listSection("organizations"),
  listSection("education"),
  listSection("certifications"),
  gridSection("skills"),
  gridSection("languages"),
  customSection,
]);

export const interchangeSchema = z
  .strictObject({
    format: z.literal(INTERCHANGE_FORMAT),
    version: z.literal(INTERCHANGE_VERSION),
    title: z.string().optional(),
    template: z.string().optional(),
    language: z.enum(["en", "id"]).optional(),
    showIcons: z.boolean().optional(),
    sectionSpacing: z.number().int().min(-24).max(60).optional(),
    font: z.string().optional(),
    letterSpacing: z.number().min(-0.5).max(0.5).optional(),
    lineHeight: z.number().min(1.2).max(2).optional(),
    header: entryShape(HEADER_SCHEMA).optional(),
    sections: z.array(sectionSchema).optional(),
  })
  .superRefine((value, ctx) => {
    const seen = new Set<string>();
    (value.sections ?? []).forEach((section, index) => {
      if (section.type === "custom") {
        const variant = section.variant ?? "rich";
        if (variant === "rich" && section.entries !== undefined) {
          ctx.addIssue({
            code: "custom",
            path: ["sections", index, "entries"],
            message: 'a "rich" custom section uses "body", not "entries"',
          });
        }
        if (variant === "list" && section.body !== undefined) {
          ctx.addIssue({
            code: "custom",
            path: ["sections", index, "body"],
            message: 'a "list" custom section uses "entries", not "body"',
          });
        }
        return;
      }
      if (seen.has(section.type)) {
        ctx.addIssue({
          code: "custom",
          path: ["sections", index, "type"],
          message: `duplicate "${section.type}" section`,
        });
      }
      seen.add(section.type);
    });
  });

export type InterchangeResume = z.infer<typeof interchangeSchema>;
export type InterchangeSection = NonNullable<
  InterchangeResume["sections"]
>[number];
