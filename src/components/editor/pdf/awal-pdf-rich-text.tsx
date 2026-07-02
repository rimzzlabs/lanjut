import { Link, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ComponentProps } from "react";
import type { InlineRun, RichBlock } from "../rich-content";
import { PDF_COLORS } from "./awal-fonts";

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

function runKey(run: InlineRun): string {
  return `${run.href ?? ""}|${run.bold ? "b" : ""}${run.italic ? "i" : ""}|${run.text}`;
}

function InlineRuns(props: { runs: InlineRun[] }) {
  return props.runs.map((run) =>
    run.href ? (
      <Link
        key={runKey(run)}
        src={run.href}
        style={[styles.link, runStyle(run)]}
      >
        {run.text}
      </Link>
    ) : (
      <Text key={runKey(run)} style={runStyle(run)}>
        {run.text}
      </Text>
    ),
  );
}

function runsText(runs: InlineRun[]): string {
  return runs.map((run) => run.text).join("");
}

interface AwalPdfRichTextProps {
  blocks: RichBlock[];
  style?: PdfStyle;
}

/** Renders `RichBlock`s into react-pdf primitives, preserving marks and lists. */
export function AwalPdfRichText(props: AwalPdfRichTextProps) {
  if (props.blocks.length === 0) return null;
  return (
    <View style={props.style}>
      {props.blocks.map((block) => {
        if (block.type === "list") {
          return (
            <View key={block.items.map(runsText).join("|")}>
              {block.items.map((runs, index) => (
                <View key={runsText(runs)} style={styles.listItem}>
                  <Text style={styles.bullet}>
                    {block.ordered ? `${index + 1}.` : "•"}
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
          <Text key={runsText(block.runs)} style={styles.paragraph}>
            <InlineRuns runs={block.runs} />
          </Text>
        );
      })}
    </View>
  );
}
