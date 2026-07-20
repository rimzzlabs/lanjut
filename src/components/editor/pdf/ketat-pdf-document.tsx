import {
  Document,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import {
  buildResumeBlocks,
  isAtomicBlock,
  type ResumeBlock,
} from "../resume-blocks";
import type {
  CertificateItemView,
  EducationItemView,
  ExperienceItemView,
  HeaderView,
  ResumePreview,
} from "../resume-preview";
import { PdfContactIcon } from "./pdf-contact-icon";
import {
  type FontScales,
  fontScales,
  NO_SCALE,
  PdfFontContext,
  PdfStylesContext,
  pdfTypography,
  usePdfFontFamily,
  usePdfStyles,
} from "./pdf-font";
import { PDF_COLORS } from "./pdf-fonts";
import { dateRange, PdfGrid } from "./pdf-grid";
import { PdfRichText } from "./pdf-rich-text";

// Font sizes are multiplied by the document's per-group scales (name, title,
// body); every other value is fixed. At NO_SCALE this is the baseline sheet.
const makeStyles = (s: FontScales) =>
  StyleSheet.create({
    page: {
      paddingVertical: 40,
      paddingHorizontal: 44,
      fontFamily: "Inter",
      fontSize: 9 * s.body,
      color: PDF_COLORS.foreground,
      lineHeight: 1.4,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 24,
    },
    headerLeft: { flexShrink: 1 },
    // No letterSpacing anywhere in PDF styles: react-pdf places letter-spaced
    // glyphs individually, which destroys word boundaries in text extraction.
    name: {
      fontFamily: "Lora",
      fontSize: 19 * s.name,
      textTransform: "uppercase",
      lineHeight: 1.25,
    },
    headline: {
      marginTop: 2,
      fontFamily: "Lora",
      fontSize: 11 * s.name,
      color: PDF_COLORS.muted,
    },
    headerRight: { alignItems: "flex-end", gap: 4 },
    contactRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    linkPlain: { color: PDF_COLORS.foreground, textDecoration: "none" },
    heading: {
      borderTopWidth: 0.75,
      borderTopColor: PDF_COLORS.border,
      borderBottomWidth: 0.75,
      borderBottomColor: PDF_COLORS.border,
      paddingVertical: 4,
      marginBottom: 4,
    },
    headingText: {
      fontFamily: "Lora",
      fontSize: 11.5 * s.title,
      textAlign: "center",
    },
    entryTitle: { fontSize: 9.5 * s.body, fontWeight: 600 },
    subtitleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      gap: 8,
    },
    subtitle: { fontSize: 9 * s.body, color: PDF_COLORS.muted },
    subtitleLink: { color: PDF_COLORS.muted, textDecoration: "none" },
    entryDate: {
      fontSize: 9 * s.body,
      fontStyle: "italic",
      color: PDF_COLORS.muted,
      flexShrink: 0,
    },
    body: { marginTop: 3 },
  });

const baseStyles = makeStyles(NO_SCALE);

function KetatHeader(props: { header: HeaderView }) {
  const styles = usePdfStyles(baseStyles);
  const serif = usePdfFontFamily("Lora");
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={[styles.name, { fontFamily: serif }]}>
          {props.header.fullName}
        </Text>
        {props.header.headline ? (
          <Text style={[styles.headline, { fontFamily: serif }]}>
            {props.header.headline}
          </Text>
        ) : null}
      </View>
      <View style={styles.headerRight}>
        {props.header.contacts.map((contact) => (
          <View key={contact.kind} style={styles.contactRow}>
            {contact.href ? (
              <Link src={contact.href} style={styles.linkPlain}>
                {contact.value}
              </Link>
            ) : (
              <Text>{contact.value}</Text>
            )}
            {props.header.showIcons ? (
              <PdfContactIcon kind={contact.kind} />
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

function KetatExperience(props: { item: ExperienceItemView }) {
  const styles = usePdfStyles(baseStyles);
  return (
    <View>
      <Text style={styles.entryTitle}>
        {props.item.roleHref ? (
          <Link
            src={props.item.roleHref}
            style={[
              styles.entryTitle,
              { color: PDF_COLORS.foreground, textDecoration: "none" },
            ]}
          >
            {props.item.role}
          </Link>
        ) : (
          props.item.role
        )}
      </Text>
      <View style={styles.subtitleRow}>
        <Text style={styles.subtitle}>
          {props.item.companyHref ? (
            <Link src={props.item.companyHref} style={styles.subtitleLink}>
              {props.item.company}
            </Link>
          ) : (
            props.item.company
          )}
        </Text>
        <Text style={styles.entryDate}>
          {dateRange(props.item.startDate, props.item.endDate)}
        </Text>
      </View>
      <PdfRichText blocks={props.item.description} style={styles.body} />
    </View>
  );
}

function KetatEducation(props: { item: EducationItemView }) {
  const styles = usePdfStyles(baseStyles);
  return (
    <View>
      <Text style={styles.entryTitle}>{props.item.degree}</Text>
      <View style={styles.subtitleRow}>
        <Text style={styles.subtitle}>{props.item.institution}</Text>
        <Text style={styles.entryDate}>
          {dateRange(props.item.startDate, props.item.endDate)}
        </Text>
      </View>
      <PdfRichText blocks={props.item.details} style={styles.body} />
    </View>
  );
}

function KetatCertificate(props: { item: CertificateItemView }) {
  const styles = usePdfStyles(baseStyles);
  const range = dateRange(props.item.startDate, props.item.endDate);
  return (
    <View>
      <View style={styles.subtitleRow}>
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

function KetatBlock(props: { block: ResumeBlock }) {
  const styles = usePdfStyles(baseStyles);
  const serif = usePdfFontFamily("Lora");
  const { block } = props;
  switch (block.kind) {
    case "header":
      return <KetatHeader header={block.header} />;
    case "heading":
      return (
        <View style={styles.heading}>
          <Text style={[styles.headingText, { fontFamily: serif }]}>
            {block.title}
          </Text>
        </View>
      );
    case "summary":
      return <PdfRichText blocks={block.body} />;
    case "experience":
      return <KetatExperience item={block.item} />;
    case "education":
      return <KetatEducation item={block.item} />;
    case "certificate":
      return <KetatCertificate item={block.item} />;
    case "skills":
      return <PdfGrid items={block.items} columns={block.columns} />;
    case "languages":
      return <PdfGrid items={block.items} columns={block.columns} />;
  }
}

/**
 * "Ketat" as a react-pdf document: a compact serif classic with centered, ruled
 * headings. Consumes the same linear `buildResumeBlocks` sequence as every
 * template, so reading order and extraction are identical to Awal.
 */
export function KetatPdfDocument(props: { preview: ResumePreview }) {
  const blocks = buildResumeBlocks(props.preview);
  const typography = pdfTypography(props.preview);
  const styles = makeStyles(fontScales(props.preview));
  return (
    <PdfFontContext.Provider value={typography.family}>
      <PdfStylesContext.Provider value={styles}>
        <Document>
          <Page
            size="A4"
            style={
              typography.page ? [styles.page, typography.page] : styles.page
            }
          >
            {blocks.map((block) => (
              <View
                key={block.id}
                style={{ marginTop: block.gapBefore }}
                minPresenceAhead={block.keepWithNext ? 48 : 0}
                wrap={isAtomicBlock(block) ? false : undefined}
              >
                <KetatBlock block={block} />
              </View>
            ))}
          </Page>
        </Document>
      </PdfStylesContext.Provider>
    </PdfFontContext.Provider>
  );
}
