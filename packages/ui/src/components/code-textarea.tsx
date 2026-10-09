import type * as React from "react";
import { cn } from "../lib/utils";
import { ScrollArea } from "./scroll-area";

// The textarea and its mirror must lay text out alike, so they share every
// class that moves a glyph.
const LAYER =
  "col-start-1 row-start-1 m-0 min-w-0 border-0 p-3 font-mono text-base/6 tracking-normal whitespace-pre-wrap wrap-anywhere md:text-sm/6";

/**
 * A textarea that shows its text in color. The textarea keeps the text, the
 * caret, and the selection, and draws its own glyphs transparent. A mirror
 * under it draws the same text from `highlighted`. Both sit in one grid cell,
 * so the cell grows with the text and the frame scrolls the two as one. Give
 * the frame a height through `className`.
 */
function CodeTextarea({
  className,
  highlighted,
  ...props
}: React.ComponentProps<"textarea"> & { highlighted: React.ReactNode }) {
  return (
    <div
      data-slot="code-textarea"
      className={cn(
        "grid rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40",
        className,
      )}
    >
      <ScrollArea className="min-h-0">
        <div className="grid min-h-full">
          <pre aria-hidden className={cn(LAYER, "pointer-events-none")}>
            {highlighted}
            {/* A textarea ending in a line break shows an empty last line; a
                pre needs one more break to show it too. */}
            {"\n"}
          </pre>
          <textarea
            data-slot="code-textarea-input"
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className={cn(
              LAYER,
              "resize-none overflow-hidden bg-transparent text-transparent caret-foreground outline-none selection:bg-primary/25 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
            )}
            {...props}
          />
        </div>
      </ScrollArea>
    </div>
  );
}

export { CodeTextarea };
