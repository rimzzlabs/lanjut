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
function makeStyles(s: FontScales) {
  return StyleSheet.create({
    page: {
      paddingVertical: 40,
      paddingHorizontal: 44,
      fontFamily: "Inter",
      fontSize: 9 * s.body,
      color: PDF_COLORS.foreground,
      lineHeight: 1.4,
    },
    name: { fontSize: 22 * s.name, fontWeight: 700, lineHeight: 1.2 },
    headline: {
      marginTop: 2,
      fontSize: 10.5 * s.name,
      fontWeight: 600,
      color: PDF_COLORS.muted,
    },
    contactRowWrap: {
      marginTop: 6,
      flexDirection: "row",
      flexWrap: "wrap",
      columnGap: 12,
      rowGap: 3,
    },
    contactRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    linkPlain: { color: PDF_COLORS.foreground, textDecoration: "underline" },
    heading: {
      borderTopWidth: 2,
      borderTopColor: PDF_COLORS.foreground,
      paddingTop: 3,
    },
    headingText: {
      fontSize: 10 * s.title,
      fontWeight: 700,
      textTransform: "uppercase",
    },
    entryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      gap: 8,
    },
    entryTitle: { fontSize: 10 * s.body, fontWeight: 700 },
    entryDate: {
      fontSize: 9 * s.body,
      fontWeight: 600,
      color: PDF_COLORS.muted,
      flexShrink: 0,
    },
    subtitle: {
      fontSize: 9 * s.body,
      fontWeight: 600,
      color: PDF_COLORS.muted,
    },
    subtitleLink: { color: PDF_COLORS.muted, textDecoration: "underline" },
    body: { marginTop: 3 },
  });
}

const baseStyles = makeStyles(NO_SCALE);

function TebalHeader(props: { header: HeaderView }) {
  const styles = usePdfStyles(baseStyles);
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
      <PdfHeaderPhoto header={props.header} />
      <View>
        <Text style={styles.name}>{props.header.fullName}</Text>
        {Boolean(props.header.headline) && (
          <Text style={styles.headline}>{props.header.headline}</Text>
        )}
        {A.isNotEmpty(props.header.contacts) && (
          <View style={styles.contactRowWrap}>
            {props.header.contacts.map((contact) => (
              <View key={contact.kind} style={styles.contactRow}>
                {props.header.showIcons && (
                  <PdfContactIcon kind={contact.kind} />
                )}
                <PdfOptionalLink
                  href={contact.href}
                  style={styles.linkPlain}
                  wrapPlain
                >
                  {contact.value}
                </PdfOptionalLink>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

function TebalExperience(props: { item: ExperienceItemView }) {
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
        <PdfOptionalLink
          href={props.item.companyHref}
          style={styles.subtitleLink}
        >
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

function TebalEducation(props: { item: EducationItemView }) {
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

function TebalCertificate(props: { item: CertificateItemView }) {
  const styles = usePdfStyles(baseStyles);
  const range = dateRange(props.item.startDate, props.item.endDate);
  return (
    <View>
      <View style={styles.entryRow}>
        <Text style={styles.entryTitle}>
          <PdfOptionalLink href={props.item.href} style={styles.linkPlain}>
            {props.item.title}
          </PdfOptionalLink>
        </Text>
        {range ? <Text style={styles.entryDate}>{range}</Text> : null}
      </View>
      <Text style={styles.subtitle}>{props.item.issuer}</Text>
    </View>
  );
}

function TebalBlock(props: { block: ResumeBlock }) {
  const styles = usePdfStyles(baseStyles);
  const { block } = props;
  switch (block.kind) {
    case "header":
      return <TebalHeader header={block.header} />;
    case "heading":
      return (
        <View style={styles.heading}>
          <Text style={styles.headingText}>{block.title}</Text>
        </View>
      );
    case "summary":
      return <PdfRichText blocks={block.body} />;
    case "experience":
      return <TebalExperience item={block.item} />;
    case "education":
      return <TebalEducation item={block.item} />;
    case "certificate":
      return <TebalCertificate item={block.item} />;
    case "skills":
      return <PdfGrid items={block.items} columns={block.columns} />;
    case "languages":
      return <PdfGrid items={block.items} columns={block.columns} />;
  }
}

/**
 * "Tebal" as a react-pdf document: bold modern hierarchy with thick heading
 * rules. Consumes the same linear `buildResumeBlocks` sequence as every
 * template, so reading order and extraction are identical.
 */
export function TebalPdfDocument(props: { preview: ResumePreview }) {
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
              <TebalBlock block={block} />
            </View>
          ))}
        </Page>
      </Document>
    </PdfStylesContext.Provider>
  );
}
