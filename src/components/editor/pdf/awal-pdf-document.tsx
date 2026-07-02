import {
  Circle,
  Document,
  Link,
  Page,
  Path,
  Rect,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import { buildResumeBlocks, type ResumeBlock } from "../resume-blocks";
import type {
  CertificateItemView,
  ContactKind,
  EducationItemView,
  ExperienceItemView,
  HeaderView,
  LanguageItemView,
  ResumePreview,
  SkillItemView,
} from "../resume-preview";
import { PDF_COLORS } from "./awal-fonts";
import { AwalPdfRichText } from "./awal-pdf-rich-text";

const styles = StyleSheet.create({
  page: {
    paddingVertical: 40,
    paddingHorizontal: 44,
    fontFamily: "Inter",
    fontSize: 9,
    color: PDF_COLORS.foreground,
    lineHeight: 1.4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  headerLeft: { flexShrink: 1 },
  name: { fontSize: 18, fontWeight: 700, lineHeight: 1.25 },
  headline: { marginTop: 2, fontSize: 10.5, color: PDF_COLORS.muted },
  headerRight: { alignItems: "flex-start", gap: 3 },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  linkPlain: { color: PDF_COLORS.foreground, textDecoration: "none" },
  heading: {
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingBottom: 2,
    borderBottomWidth: 0.75,
    borderBottomStyle: "dotted",
    borderBottomColor: PDF_COLORS.border,
    marginBottom: 4,
  },
  entryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 8,
  },
  entryTitle: { fontSize: 9.5, fontWeight: 600 },
  entryDate: { fontSize: 9, color: PDF_COLORS.muted, flexShrink: 0 },
  subtitle: { fontSize: 9, color: PDF_COLORS.muted },
  subtitleLink: { color: PDF_COLORS.muted, textDecoration: "none" },
  body: { marginTop: 3 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  gridItem: {
    width: "50%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    paddingRight: 16,
    marginBottom: 2,
  },
  gridName: { fontWeight: 600 },
  muted: { color: PDF_COLORS.muted },
});

function dateRange(start: string, end: string): string {
  if (!start && !end) return "";
  return `${start} - ${end}`;
}

const ICON = {
  stroke: PDF_COLORS.muted,
  strokeWidth: 2,
  fill: "none",
} as const;

/** lucide-equivalent contact glyphs, drawn as vector SVG (not text). */
function PdfContactIcon(props: { kind: ContactKind }) {
  switch (props.kind) {
    case "phone":
      return (
        <Svg width={8} height={8} viewBox="0 0 24 24">
          <Path
            {...ICON}
            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
          />
        </Svg>
      );
    case "email":
      return (
        <Svg width={8} height={8} viewBox="0 0 24 24">
          <Rect {...ICON} x={2} y={4} width={20} height={16} rx={2} />
          <Path {...ICON} d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </Svg>
      );
    case "website":
      return (
        <Svg width={8} height={8} viewBox="0 0 24 24">
          <Circle {...ICON} cx={12} cy={12} r={10} />
          <Path {...ICON} d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <Path {...ICON} d="M2 12h20" />
        </Svg>
      );
    case "location":
      return (
        <Svg width={8} height={8} viewBox="0 0 24 24">
          <Path
            {...ICON}
            d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
          />
          <Circle {...ICON} cx={12} cy={10} r={3} />
        </Svg>
      );
  }
}

function PdfHeader(props: { header: HeaderView }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.name}>{props.header.fullName}</Text>
        {props.header.headline ? (
          <Text style={styles.headline}>{props.header.headline}</Text>
        ) : null}
      </View>
      <View style={styles.headerRight}>
        {props.header.contacts.map((contact) => (
          <View key={contact.kind} style={styles.contactRow}>
            <PdfContactIcon kind={contact.kind} />
            {contact.href ? (
              <Link src={contact.href} style={styles.linkPlain}>
                {contact.value}
              </Link>
            ) : (
              <Text>{contact.value}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

function PdfExperience(props: { item: ExperienceItemView }) {
  return (
    <View>
      <View style={styles.entryRow}>
        <Text style={styles.entryTitle}>{props.item.role}</Text>
        <Text style={styles.entryDate}>
          {dateRange(props.item.startDate, props.item.endDate)}
        </Text>
      </View>
      <Text style={styles.subtitle}>
        {props.item.companyHref ? (
          <Link src={props.item.companyHref} style={styles.subtitleLink}>
            {props.item.company}
          </Link>
        ) : (
          props.item.company
        )}
      </Text>
      <AwalPdfRichText blocks={props.item.description} style={styles.body} />
    </View>
  );
}

function PdfEducation(props: { item: EducationItemView }) {
  return (
    <View>
      <View style={styles.entryRow}>
        <Text style={styles.entryTitle}>{props.item.degree}</Text>
        <Text style={styles.entryDate}>
          {dateRange(props.item.startDate, props.item.endDate)}
        </Text>
      </View>
      <Text style={styles.subtitle}>{props.item.institution}</Text>
      <AwalPdfRichText blocks={props.item.details} style={styles.body} />
    </View>
  );
}

function PdfCertificate(props: { item: CertificateItemView }) {
  const range = dateRange(props.item.startDate, props.item.endDate);
  return (
    <View>
      <View style={styles.entryRow}>
        <Text style={styles.entryTitle}>
          {props.item.href ? (
            <Link src={props.item.href} style={styles.linkPlain}>
              {props.item.title}
            </Link>
          ) : (
            props.item.title
          )}
        </Text>
        {range ? <Text style={styles.entryDate}>{range}</Text> : null}
      </View>
      <Text style={styles.subtitle}>{props.item.issuer}</Text>
    </View>
  );
}

function PdfGrid(props: { items: (SkillItemView | LanguageItemView)[] }) {
  return (
    <View style={styles.grid}>
      {props.items.map((item) => (
        <View key={item.id} style={styles.gridItem}>
          <Text style={styles.gridName}>{item.name}</Text>
          {item.proficiency ? (
            <Text style={styles.muted}>{item.proficiency}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function PdfBlock(props: { block: ResumeBlock }) {
  const { block } = props;
  switch (block.kind) {
    case "header":
      return <PdfHeader header={block.header} />;
    case "heading":
      return <Text style={styles.heading}>{block.title}</Text>;
    case "summary":
      return <AwalPdfRichText blocks={block.body} />;
    case "experience":
      return <PdfExperience item={block.item} />;
    case "education":
      return <PdfEducation item={block.item} />;
    case "certificate":
      return <PdfCertificate item={block.item} />;
    case "skills":
      return <PdfGrid items={block.items} />;
    case "languages":
      return <PdfGrid items={block.items} />;
  }
}

/**
 * The "Awal" résumé as a react-pdf document. It renders the same linear
 * `buildResumeBlocks` sequence the on-screen preview uses, so PDF content,
 * ordering, sorting, and empty-section gating stay identical — and the text is
 * real (extractable), never rasterized. react-pdf handles page breaks; a
 * heading's `minPresenceAhead` keeps it from being orphaned at a page foot.
 */
export function AwalPdfDocument(props: { preview: ResumePreview }) {
  const blocks = buildResumeBlocks(props.preview);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {blocks.map((block) => (
          <View
            key={block.id}
            style={{ marginTop: block.gapBefore }}
            minPresenceAhead={block.keepWithNext ? 48 : 0}
          >
            <PdfBlock block={block} />
          </View>
        ))}
      </Page>
    </Document>
  );
}
