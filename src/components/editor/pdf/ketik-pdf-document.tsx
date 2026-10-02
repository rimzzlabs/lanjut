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
      paddingVertical: 40,
      paddingHorizontal: 44,
      fontFamily: "Inter",
      fontSize: 9 * s.body,
      color: PDF_COLORS.foreground,
      lineHeight: 1.4,
    },
    name: {
      fontFamily: "GeistMono",
      fontSize: 16 * s.name,
      fontWeight: 700,
      lineHeight: 1.25,
    },
    headline: {
      marginTop: 2,
      fontFamily: "GeistMono",
      fontSize: 10 * s.name,
      color: PDF_COLORS.muted,
    },
    contactLine: {
      marginTop: 4,
      fontFamily: "GeistMono",
      fontSize: 8 * s.body,
      color: PDF_COLORS.muted,
    },
    linkMuted: { color: PDF_COLORS.muted, textDecoration: "underline" },
    heading: {
      fontFamily: "GeistMono",
      fontSize: 9.5 * s.title,
      fontWeight: 700,
      textTransform: "uppercase",
      borderBottomWidth: 0.75,
      borderBottomStyle: "dashed",
      borderBottomColor: PDF_COLORS.border,
      paddingBottom: 3,
    },
    entryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      gap: 8,
    },
    entryTitle: {
      fontFamily: "GeistMono",
      fontSize: 9 * s.body,
      fontWeight: 700,
    },
    entryDate: {
      fontFamily: "GeistMono",
      fontSize: 8 * s.body,
      color: PDF_COLORS.muted,
      flexShrink: 0,
    },
    subtitle: { fontSize: 9 * s.body, color: PDF_COLORS.muted },
    body: { marginTop: 3 },
  });
}

const baseStyles = makeStyles(NO_SCALE);

function KetikContactLine(props: { contacts: ReadonlyArray<ContactView> }) {
  const styles = usePdfStyles(baseStyles);
  const mono = usePdfFontFamily("GeistMono");
  // Single-spaced separator, same wrap fix as LuasaContactLine (#145).
  return (
    <Text style={[styles.contactLine, { fontFamily: mono }]}>
      {props.contacts.map((contact, index) => (
        <Text key={contact.kind}>
          {index > 0 ? " | " : ""}
          <PdfOptionalLink href={contact.href} style={styles.linkMuted}>
            {contact.value}
          </PdfOptionalLink>
        </Text>
      ))}
    </Text>
  );
}

function KetikHeader(props: { header: HeaderView }) {
  const styles = usePdfStyles(baseStyles);
  const mono = usePdfFontFamily("GeistMono");
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
      <PdfHeaderPhoto header={props.header} />
      <View>
        <Text style={[styles.name, { fontFamily: mono }]}>
          {props.header.fullName}
        </Text>
        {Boolean(props.header.headline) && (
          <Text style={[styles.headline, { fontFamily: mono }]}>
            {props.header.headline}
          </Text>
        )}
        {A.isNotEmpty(props.header.contacts) && (
          <KetikContactLine contacts={props.header.contacts} />
        )}
      </View>
    </View>
  );
}

function KetikExperience(props: { item: ExperienceItemView }) {
  const styles = usePdfStyles(baseStyles);
  const mono = usePdfFontFamily("GeistMono");
  return (
    <View>
      <View style={styles.entryRow}>
        <Text style={[styles.entryTitle, { fontFamily: mono }]}>
          <PdfOptionalLink
            href={props.item.roleHref}
            style={[
              styles.entryTitle,
              {
                fontFamily: mono,
                color: PDF_COLORS.foreground,
                textDecoration: "underline",
              },
            ]}
          >
            {props.item.role}
          </PdfOptionalLink>
        </Text>
        <Text style={[styles.entryDate, { fontFamily: mono }]}>
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

function KetikEducation(props: { item: EducationItemView }) {
  const styles = usePdfStyles(baseStyles);
  const mono = usePdfFontFamily("GeistMono");
  return (
    <View>
      <View style={styles.entryRow}>
        <Text style={[styles.entryTitle, { fontFamily: mono }]}>
          {props.item.degree}
        </Text>
        <Text style={[styles.entryDate, { fontFamily: mono }]}>
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

function KetikCertificate(props: { item: CertificateItemView }) {
  const styles = usePdfStyles(baseStyles);
  const mono = usePdfFontFamily("GeistMono");
  const range = dateRange(props.item.startDate, props.item.endDate);
  return (
    <View>
      <View style={styles.entryRow}>
        <Text style={[styles.entryTitle, { fontFamily: mono }]}>
          <PdfOptionalLink href={props.item.href} style={styles.linkMuted}>
            {props.item.title}
          </PdfOptionalLink>
        </Text>
        {Boolean(range) && (
          <Text style={[styles.entryDate, { fontFamily: mono }]}>{range}</Text>
        )}
      </View>
      <Text style={styles.subtitle}>{props.item.issuer}</Text>
    </View>
  );
}

function KetikBlock(props: { block: ResumeBlock }) {
  const styles = usePdfStyles(baseStyles);
  const mono = usePdfFontFamily("GeistMono");
  const { block } = props;
  switch (block.kind) {
    case "header":
      return <KetikHeader header={block.header} />;
    case "heading":
      return (
        <Text style={[styles.heading, { fontFamily: mono }]}>
          {block.title}
        </Text>
      );
    case "summary":
      return <PdfRichText blocks={block.body} />;
    case "experience":
      return <KetikExperience item={block.item} />;
    case "education":
      return <KetikEducation item={block.item} />;
    case "certificate":
      return <KetikCertificate item={block.item} />;
    case "skills":
      return <PdfGrid items={block.items} columns={block.columns} />;
    case "languages":
      return <PdfGrid items={block.items} columns={block.columns} />;
  }
}

/**
 * "Ketik" as a react-pdf document: typewriter-flavored monospace accents (Geist
 * Mono, matching the preview's --font-mono) over a sans body. Consumes the same
 * linear `buildResumeBlocks` sequence as every template, so reading order and
 * extraction are identical.
 */
export function KetikPdfDocument(props: { preview: ResumePreview }) {
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
                <KetikBlock block={block} />
              </View>
            ))}
          </Page>
        </Document>
      </PdfStylesContext.Provider>
    </PdfFontContext.Provider>
  );
}
