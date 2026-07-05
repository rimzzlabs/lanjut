import { Link, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ComponentProps } from "react";
import type { InlineRun, RichBlock } from "../rich-content";
import { PDF_COLORS } from "./pdf-fonts";

type PdfStyle = ComponentProps<typeof View>["style"];

const styles = StyleSheet.create({
  paragraph: { marginBottom: 3 },
  listItem: { flexDirection: "row", marginBottom: 2 },
  bullet: { width: 12 },
  itemBody: { flex: 1 },
  link: { color: PDF_COLORS.foreground, textDecoration: "underline" },
});

function runStyle(run: InlineRun): {
  fontWeight: 400 | 700;
  fontStyle: "italic" | "normal";
} {
  return {
    fontWeight: run.bold ? 700 : 400,
    fontStyle: run.italic ? "italic" : "normal",
  };
}

/*
 * Index keys are deliberate throughout this renderer: blocks/runs are a
 * stateless linear projection re-derived wholesale from the document, never
 * reordered in place, and their text content is not unique (duplicate
 * paragraphs would collide as keys).
 */

function InlineRuns(props: { runs: InlineRun[] }) {
  return props.runs.map((run, index) =>
    run.href ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: see renderer note above
      <Link key={index} src={run.href} style={[styles.link, runStyle(run)]}>
        {run.text}
      </Link>
    ) : (
      // biome-ignore lint/suspicious/noArrayIndexKey: see renderer note above
      <Text key={index} style={runStyle(run)}>
        {run.text}
      </Text>
    ),
  );
}

interface PdfRichTextProps {
  blocks: RichBlock[];
  style?: PdfStyle;
}

/** Renders `RichBlock`s into react-pdf primitives, preserving marks and lists. */
export function PdfRichText(props: PdfRichTextProps) {
  if (props.blocks.length === 0) return null;
  return (
    <View style={props.style}>
      {props.blocks.map((block, index) => {
        if (block.type === "list") {
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: see renderer note above
            <View key={index}>
              {block.items.map((runs, itemIndex) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: see renderer note above
                <View key={itemIndex} style={styles.listItem}>
                  {/* Only "•"; the bundled font subsets lack fancier list
                      glyphs (e.g. U+25AA), which render as garbage. */}
                  <Text style={styles.bullet}>
                    {block.ordered ? `${itemIndex + 1}.` : "•"}
                  </Text>
                  <Text style={styles.itemBody}>
                    <InlineRuns runs={runs} />
                  </Text>
                </View>
              ))}
            </View>
          );
        }
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: see renderer note above
          <Text key={index} style={styles.paragraph}>
            <InlineRuns runs={block.runs} />
          </Text>
        );
      })}
    </View>
  );
}
