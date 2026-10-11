import type { CodeFormat } from "@lanjut/resume/interchange/code-edit";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lanjut/ui/components/select";
import { A } from "@mobily/ts-belt";
import { useTranslations } from "use-intl";
import { runAfterCodeGuard, useDeveloperModeStore } from "@/lib/store";
import { CODE_FORMATS } from "./code-formats";

function isFormat(value: unknown): value is CodeFormat {
  return A.some(CODE_FORMATS, (format) => format.value === value);
}

export function EditorFormatSelect() {
  const t = useTranslations("editor.code");
  const format = useDeveloperModeStore((state) => state.format);
  const setFormat = useDeveloperModeStore((state) => state.setFormat);

  return (
    <Select
      items={CODE_FORMATS}
      value={format}
      onValueChange={(value) => {
        if (isFormat(value)) runAfterCodeGuard(() => setFormat(value));
      }}
    >
      <SelectTrigger size="sm" className="w-28" aria-label={t("formatLabel")}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} side="bottom" align="end">
        <SelectGroup>
          {CODE_FORMATS.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
