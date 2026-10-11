import type { CodeFormat } from "@lanjut/resume/interchange/code-edit";

/** Markdown comes first: it is the format that the mode opens with. */
export const CODE_FORMATS: ReadonlyArray<{ value: CodeFormat; label: string }> =
  [
    { value: "markdown", label: "Markdown" },
    { value: "yaml", label: "YAML" },
    { value: "json", label: "JSON" },
  ];

export const CODE_FORMAT_NAMES: Record<CodeFormat, string> = {
  markdown: "Markdown",
  yaml: "YAML",
  json: "JSON",
};
