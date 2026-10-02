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
  PdfFontContext,
  PdfStylesContext,
  pageStyle,
  pdfTypography,
  usePdfFontFamily,
  usePdfStyles,
} from "./pdf-font";
import { PDF_COLORS } from "./pdf-fonts";
import { dateRange, PdfGrid } from "./pdf-grid";
import { PdfHeaderPhoto } from "./pdf-header-photo";
import { PdfOptionalLink } from "./pdf-optional-link";
import { PdfRichText } from "./pdf-rich-text";

// Font sizes are multiplied by the document's per-group scales (name, title,
// body); every other value is fixed. At NO_SCALE this is the baseline sheet.
function makeStyles(s: FontScales) {
  return StyleSheet.create({
    page: {
      paddingVertical: 44,
      paddingHorizontal: 48,
      fontFamily: "Inter",
      fontSize: 9 * s.body,
      color: PDF_COLORS.foreground,
      lineHeight: 1.45,
    },
    accentBar: {
      borderLeftWidth: 1.5,
      borderLeftColor: PDF_COLORS.foreground,
      paddingLeft: 12,
    },
    softBar: {
      borderLeftWidth: 1.5,
      borderLeftColor: PDF_COLORS.border,
      paddingLeft: 12,
    },
    // No letterSpacing anywhere in PDF styles: react-pdf places letter-spaced
    // glyphs individually, which destroys word boundaries in text extraction.
    name: {
      fontFamily: "Lora",
      fontSize: 18 * s.name,
      textTransform: "uppercase",
      lineHeight: 1.25,
    },
    headline: {
      marginTop: 1,
      fontFamily: "Lora",
      fontSize: 10 * s.name,
      color: PDF_COLORS.muted,
    },
    contactLine: {
      marginTop: 3,
      fontSize: 9 * s.body,
      color: PDF_COLORS.muted,
    },
    linkMuted: { color: PDF_COLORS.muted, textDecoration: "underline" },
    heading: {
      fontFamily: "Lora",
      fontSize: 9.5 * s.title,
      fontWeight: 700,
      textTransform: "uppercase",
    },
    entryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      gap: 8,
    },
    entryTitle: { fontSize: 9.5 * s.body, textTransform: "uppercase" },
    entryDate: { fontSize: 9 * s.body, color: PDF_COLORS.muted, flexShrink: 0 },
    subtitle: {
      fontSize: 9 * s.body,
      fontStyle: "italic",
      color: PDF_COLORS.muted,
    },
    body: { marginTop: 3 },
  });
}

const baseStyles = makeStyles(NO_SCALE);

function LuasaContactLine(props: { contacts: ReadonlyArray<ContactView> }) {
  const styles = usePdfStyles(baseStyles);
  // Single spaces around the bullet are load-bearing: textkit marks any word
  // not followed by exactly one plain space as a hyphenation point and injects
  // a stray "-" when the line wraps there (#145).
  return (
    <Text style={styles.contactLine}>
      {props.contacts.map((contact, index) => (
        <Text key={contact.kind}>
          {index > 0 ? " • " : ""}
          <PdfOptionalLink href={contact.href} style={styles.linkMuted}>
            {contact.value}
          </PdfOptionalLink>
        </Text>
      ))}
    </Text>
  );
}

function LuasaHeader(props: { header: HeaderView }) {
  const styles = usePdfStyles(baseStyles);
  const serif = usePdfFontFamily("Lora");
  return (
    <View
      style={[
        styles.accentBar,
        { flexDirection: "row", alignItems: "flex-start", gap: 10 },
      ]}
    >
      <PdfHeaderPhoto header={props.header} />
      <View>
        <Text style={[styles.name, { fontFamily: serif }]}>
          {props.header.fullName}
        </Text>
        {Boolean(props.header.headline) && (
          <Text style={[styles.headline, { fontFamily: serif }]}>
            {props.header.headline}
          </Text>
        )}
        {A.isNotEmpty(props.header.contacts) && (
          <LuasaContactLine contacts={props.header.contacts} />
        )}
      </View>
    </View>
  );
}

function LuasaExperience(props: { item: ExperienceItemView }) {
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

function LuasaEducation(props: { item: EducationItemView }) {
  const styles = usePdfStyles(baseStyles);
  return (
    <View style={styles.softBar}>
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

function LuasaCertificate(props: { item: CertificateItemView }) {
  const styles = usePdfStyles(baseStyles);
  const range = dateRange(props.item.startDate, props.item.endDate);
  return (
    <View style={styles.softBar}>
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

function LuasaBlock(props: { block: ResumeBlock }) {
  const styles = usePdfStyles(baseStyles);
  const serif = usePdfFontFamily("Lora");
  const { block } = props;
  switch (block.kind) {
    case "header":
      return <LuasaHeader header={block.header} />;
    case "heading":
      return (
        <Text style={[styles.heading, { fontFamily: serif }]}>
          {block.title}
        </Text>
      );
    case "summary":
      return (
        <View style={styles.softBar}>
          <PdfRichText blocks={block.body} />
        </View>
      );
    case "experience":
      return <LuasaExperience item={block.item} />;
    case "education":
      return <LuasaEducation item={block.item} />;
    case "certificate":
      return <LuasaCertificate item={block.item} />;
    case "skills":
      return <PdfGrid items={block.items} columns={block.columns} />;
    case "languages":
      return <PdfGrid items={block.items} columns={block.columns} />;
  }
}

/**
 * "Luasa" as a react-pdf document: airy minimalist layout with slim accent bars
 * and letterspaced headings. Consumes the same linear `buildResumeBlocks`
 * sequence as every template, so reading order and extraction are identical.
 */
export function LuasaPdfDocument(props: { preview: ResumePreview }) {
  const blocks = buildResumeBlocks(props.preview);
  const typography = pdfTypography(props.preview);
  const styles = makeStyles(fontScales(props.preview));
  return (
    <PdfFontContext.Provider value={typography.family}>
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
                <LuasaBlock block={block} />
              </View>
            ))}
          </Page>
        </Document>
      </PdfStylesContext.Provider>
    </PdfFontContext.Provider>
  );
}
