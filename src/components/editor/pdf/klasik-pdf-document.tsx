import { A } from "@mobily/ts-belt";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import {
  buildResumeBlocks,
  isAtomicBlock,
  type ResumeBlock,
} from "../resume-blocks";
import { locationSuffix, withLocation } from "../resume-entry-location";
import type {
  CertificateItemView,
  ContactView,
  EducationItemView,
  ExperienceItemView,
  HeaderView,
  ResumePreview,
} from "../resume-preview";
import {
  type FontScales,
  fontScales,
  NO_SCALE,
  PdfStylesContext,
  pageStyle,
  pdfTypography,
  usePdfStyles,
} from "./pdf-font";
import { PDF_COLORS } from "./pdf-fonts";
import { dateRange, PdfGrid } from "./pdf-grid";
import { PdfHeaderPhoto } from "./pdf-header-photo";
import { PdfOptionalLink } from "./pdf-optional-link";
import { PdfRichText } from "./pdf-rich-text";

// Font sizes are multiplied by the document's per-group scales (name, title,
// body); every other value is fixed. At NO_SCALE this is the baseline sheet.
const makeStyles = (s: FontScales) =>
  StyleSheet.create({
    page: {
      paddingVertical: 44,
      paddingHorizontal: 48,
      fontFamily: "Lora",
      fontSize: 9 * s.body,
      color: PDF_COLORS.foreground,
      lineHeight: 1.45,
    },
    header: { alignItems: "center" },
    name: { fontSize: 20 * s.name, lineHeight: 1.25 },
    headline: {
      marginTop: 1,
      fontSize: 10 * s.name,
      fontStyle: "italic",
      color: PDF_COLORS.muted,
    },
    contactLine: {
      marginTop: 4,
      fontSize: 9 * s.body,
      color: PDF_COLORS.muted,
      textAlign: "center",
    },
    linkMuted: { color: PDF_COLORS.muted, textDecoration: "underline" },
    heading: {
      borderBottomWidth: 0.5,
      borderBottomColor: PDF_COLORS.border,
      paddingBottom: 3,
    },
    headingText: {
      fontSize: 10.5 * s.title,
      textTransform: "uppercase",
      textAlign: "center",
    },
    entryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      gap: 8,
    },
    entryTitle: { fontSize: 9.5 * s.body, fontWeight: 700 },
    entryDate: {
      fontSize: 9 * s.body,
      fontStyle: "italic",
      color: PDF_COLORS.muted,
      flexShrink: 0,
    },
    subtitle: { fontSize: 9 * s.body, color: PDF_COLORS.muted },
    body: { marginTop: 3 },
  });

const baseStyles = makeStyles(NO_SCALE);

function KlasikContactLine(props: { contacts: ReadonlyArray<ContactView> }) {
  const styles = usePdfStyles(baseStyles);
  // Single-spaced separator, same wrap fix as LuasaContactLine (#145).
  return (
    <Text style={styles.contactLine}>
      {props.contacts.map((contact, index) => (
        <Text key={contact.kind}>
          {index > 0 ? " · " : ""}
          <PdfOptionalLink href={contact.href} style={styles.linkMuted}>
            {contact.value}
          </PdfOptionalLink>
        </Text>
      ))}
    </Text>
  );
}

function KlasikHeader(props: { header: HeaderView }) {
  const styles = usePdfStyles(baseStyles);
  return (
    <View style={styles.header}>
      <PdfHeaderPhoto header={props.header} centered />
      <Text style={styles.name}>{props.header.fullName}</Text>
      {Boolean(props.header.headline) && (
        <Text style={styles.headline}>{props.header.headline}</Text>
      )}
      {A.isNotEmpty(props.header.contacts) && (
        <KlasikContactLine contacts={props.header.contacts} />
      )}
    </View>
  );
}

function KlasikExperience(props: { item: ExperienceItemView }) {
  const styles = usePdfStyles(baseStyles);
  return (
    <View>
      <View style={styles.entryRow}>
        <Text style={styles.entryTitle}>
          <PdfOptionalLink
            href={props.item.roleHref}
            style={[
              styles.entryTitle,
              { color: PDF_COLORS.foreground, textDecoration: "underline" },
            ]}
          >
            {props.item.role}
          </PdfOptionalLink>
        </Text>
        <Text style={styles.entryDate}>
          {dateRange(props.item.startDate, props.item.endDate)}
        </Text>
      </View>
      <Text style={styles.subtitle}>
        <PdfOptionalLink href={props.item.companyHref} style={styles.linkMuted}>
          {props.item.company}
        </PdfOptionalLink>
        {locationSuffix(props.item.company, props.item.location)}
      </Text>
      {Boolean(props.item.companyContext) && (
        <Text style={styles.subtitle}>{props.item.companyContext}</Text>
      )}
      <PdfRichText blocks={props.item.description} style={styles.body} />
    </View>
  );
}

function KlasikEducation(props: { item: EducationItemView }) {
  const styles = usePdfStyles(baseStyles);
  return (
    <View>
      <View style={styles.entryRow}>
        <Text style={styles.entryTitle}>{props.item.degree}</Text>
        <Text style={styles.entryDate}>
          {dateRange(props.item.startDate, props.item.endDate)}
        </Text>
      </View>
      <Text style={styles.subtitle}>
        {withLocation(props.item.institution, props.item.location)}
      </Text>
      <PdfRichText blocks={props.item.details} style={styles.body} />
    </View>
  );
}

function KlasikCertificate(props: { item: CertificateItemView }) {
  const styles = usePdfStyles(baseStyles);
  const range = dateRange(props.item.startDate, props.item.endDate);
  return (
    <View>
      <View style={styles.entryRow}>
        <Text style={styles.entryTitle}>
          <PdfOptionalLink href={props.item.href} style={styles.linkMuted}>
            {props.item.title}
          </PdfOptionalLink>
        </Text>
        {range ? <Text style={styles.entryDate}>{range}</Text> : null}
      </View>
      <Text style={styles.subtitle}>{props.item.issuer}</Text>
    </View>
  );
}

function KlasikBlock(props: { block: ResumeBlock }) {
  const styles = usePdfStyles(baseStyles);
  const { block } = props;
  switch (block.kind) {
    case "header":
      return <KlasikHeader header={block.header} />;
    case "heading":
      return (
        <View style={styles.heading}>
          <Text style={styles.headingText}>{block.title}</Text>
        </View>
      );
    case "summary":
      return <PdfRichText blocks={block.body} />;
    case "experience":
      return <KlasikExperience item={block.item} />;
    case "education":
      return <KlasikEducation item={block.item} />;
    case "certificate":
      return <KlasikCertificate item={block.item} />;
    case "skills":
      return <PdfGrid items={block.items} columns={block.columns} />;
    case "languages":
      return <PdfGrid items={block.items} columns={block.columns} />;
  }
}

/**
 * "Klasik" as a react-pdf document: a traditional all-serif CV with a centered
 * header and quiet centered headings. Consumes the same linear
 * `buildResumeBlocks` sequence as every template, so reading order and
 * extraction are identical.
 */
export function KlasikPdfDocument(props: { preview: ResumePreview }) {
  const blocks = buildResumeBlocks(props.preview);
  const typography = pdfTypography(props.preview);
  const styles = makeStyles(fontScales(props.preview));
  return (
    <PdfStylesContext.Provider value={styles}>
      <Document>
        <Page size="A4" style={pageStyle(styles.page, typography)}>
          {blocks.map((block) => (
            <View
              key={block.id}
              style={{ marginTop: block.gapBefore }}
              minPresenceAhead={block.keepWithNext ? 48 : 0}
              wrap={isAtomicBlock(block) ? false : undefined}
            >
              <KlasikBlock block={block} />
            </View>
          ))}
        </Page>
      </Document>
    </PdfStylesContext.Provider>
  );
}
