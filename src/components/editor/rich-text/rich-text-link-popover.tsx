"use client";

import type { Editor } from "@tiptap/react";
import { Link2, Link2Off } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Toggle } from "@/components/ui/toggle";

interface RichTextLinkPopoverProps {
  editor: Editor;
  active: boolean;
}

/** Accepts bare hosts (prepends https://) and passes through http(s)/mailto. */
function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (trimmed.length === 0) return null;
  if (/^(https?:\/\/|mailto:)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function RichTextLinkPopover(props: RichTextLinkPopoverProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const t = useTranslations("editor.richText");

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) setUrl(props.editor.getAttributes("link").href ?? "");
  };

  const apply = () => {
    const href = normalizeUrl(url);
    const chain = props.editor.chain().focus().extendMarkRange("link");
    if (href) chain.setLink({ href }).run();
    else chain.unsetLink().run();
    setOpen(false);
  };

  const remove = () => {
    props.editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        render={
          <Toggle size="xs" pressed={props.active} aria-label={t("link")}>
            <Link2 />
          </Toggle>
        }
      />
      <PopoverContent align="start" className="w-64 gap-2 p-2">
        <div className="flex items-center gap-2">
          <Input
            autoFocus
            value={url}
            placeholder={t("linkPlaceholder")}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                apply();
              }
            }}
          />
          <Button type="button" size="sm" onClick={apply}>
            {t("apply")}
          </Button>
        </div>
        {props.active && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="justify-start gap-2"
            onClick={remove}
          >
            <Link2Off /> {t("removeLink")}
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
