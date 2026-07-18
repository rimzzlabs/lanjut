"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FONT_LABELS, FONTS, type FontCategory } from "@/lib/fonts";
import { useResumeStore } from "@/lib/store";

const CATEGORIES: FontCategory[] = ["sans", "serif", "mono"];
const GROUP_KEY = {
  sans: "fontSans",
  serif: "fontSerif",
  mono: "fontMono",
} as const;

/** Sentinel Select value for "no override"; the document stores no font id. */
const TEMPLATE_DEFAULT = "template-default";

export function EditorDocumentFont() {
  const hasOpen = useResumeStore((state) => state.open !== null);
  const font = useResumeStore((state) => state.open?.font ?? TEMPLATE_DEFAULT);
  const updateOpen = useResumeStore((state) => state.updateOpen);
  const t = useTranslations("editor.layout");

  if (!hasOpen) return null;

  // base-ui's Select.Value renders the raw value unless the root gets a
  // value-to-label mapping.
  const items = {
    [TEMPLATE_DEFAULT]: t("fontTemplateDefault"),
    ...FONT_LABELS,
  };

  const onValueChange = (value: string | null) => {
    if (!value) return;
    updateOpen((draft) => {
      if (value === TEMPLATE_DEFAULT) {
        delete draft.font;
      } else {
        draft.font = value;
      }
    });
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <span
        id="document-font-label"
        className="shrink-0 text-sm text-muted-foreground"
      >
        {t("documentFont")}
      </span>
      <Select value={font} onValueChange={onValueChange} items={items}>
        <SelectTrigger aria-labelledby="document-font-label" className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={TEMPLATE_DEFAULT}>
              {t("fontTemplateDefault")}
            </SelectItem>
          </SelectGroup>
          {CATEGORIES.map((category) => (
            <SelectGroup key={category}>
              <SelectLabel>{t(GROUP_KEY[category])}</SelectLabel>
              {FONTS.filter((font) => font.category === category).map(
                (font) => (
                  <SelectItem key={font.id} value={font.id}>
                    {FONT_LABELS[font.id]}
                  </SelectItem>
                ),
              )}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
