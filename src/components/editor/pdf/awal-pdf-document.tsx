import {
  Document,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { buildResumeBlocks, type ResumeBlock } from "../resume-blocks";
import type {
  CertificateItemView,
  EducationItemView,
  ExperienceItemView,
  HeaderView,
  ResumePreview,
} from "../resume-preview";
import { PdfContactIcon } from "./pdf-contact-icon";
import { PDF_COLORS } from "./pdf-fonts";
import { dateRange, PdfGrid } from "./pdf-grid";
import { PdfRichText } from "./pdf-rich-text";

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
});

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
      <PdfRichText blocks={props.item.description} style={styles.body} />
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
      <PdfRichText blocks={props.item.details} style={styles.body} />
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

function PdfBlock(props: { block: ResumeBlock }) {
  const { block } = props;
  switch (block.kind) {
    case "header":
      return <PdfHeader header={block.header} />;
    case "heading":
      return <Text style={styles.heading}>{block.title}</Text>;
    case "summary":
      return <PdfRichText blocks={block.body} />;
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
 * ordering, sorting, and empty-section gating stay identical, and the text is
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
