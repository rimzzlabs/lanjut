import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { SectionColumns } from "@/lib/resume/types";
import type { LanguageItemView, SkillItemView } from "../resume-preview";
import { PDF_COLORS } from "./pdf-fonts";

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap" },
  gridItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    paddingRight: 16,
    marginBottom: 2,
  },
  gridName: { fontWeight: 600 },
  muted: { color: PDF_COLORS.muted },
});

/** "MMM YYYY - MMM YYYY", or empty when both ends are blank. */
export function dateRange(start: string, end: string): string {
  if (!start && !end) return "";
  return `${start} - ${end}`;
}

/**
 * [name … proficiency] grid shared by the Skills/Languages blocks. `columns`
 * controls only the visual layout: items are still emitted in linear reading
 * order, so text extraction is unaffected by the column count (defaults to two).
 */
export function PdfGrid(props: {
  items: (SkillItemView | LanguageItemView)[];
  columns?: SectionColumns;
}) {
  const width = props.columns === 1 ? "100%" : "50%";
  return (
    <View style={styles.grid}>
      {props.items.map((item) => (
        <View key={item.id} style={[styles.gridItem, { width }]}>
          <Text style={styles.gridName}>{item.name}</Text>
          {item.proficiency ? (
            <Text style={styles.muted}>{item.proficiency}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}
