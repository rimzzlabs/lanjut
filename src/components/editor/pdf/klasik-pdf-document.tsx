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
  ContactView,
  EducationItemView,
  ExperienceItemView,
  HeaderView,
  ResumePreview,
} from "../resume-preview";
import { PDF_COLORS } from "./pdf-fonts";
import { dateRange, PdfGrid } from "./pdf-grid";
import { PdfRichText } from "./pdf-rich-text";

const styles = StyleSheet.create({
  page: {
    paddingVertical: 44,
    paddingHorizontal: 48,
    fontFamily: "Lora",
    fontSize: 9,
    color: PDF_COLORS.foreground,
    lineHeight: 1.45,
  },
  header: { alignItems: "center" },
  name: { fontSize: 20, lineHeight: 1.25 },
  headline: {
    marginTop: 1,
    fontSize: 10,
    fontStyle: "italic",
    color: PDF_COLORS.muted,
  },
  contactLine: {
    marginTop: 4,
    fontSize: 9,
    color: PDF_COLORS.muted,
    textAlign: "center",
  },
  linkMuted: { color: PDF_COLORS.muted, textDecoration: "none" },
  heading: {
    borderBottomWidth: 0.5,
    borderBottomColor: PDF_COLORS.border,
    paddingBottom: 3,
  },
  headingText: {
    fontSize: 10.5,
    textTransform: "uppercase",
    textAlign: "center",
  },
  entryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 8,
  },
  entryTitle: { fontSize: 9.5, fontWeight: 700 },
  entryDate: {
    fontSize: 9,
    fontStyle: "italic",
    color: PDF_COLORS.muted,
    flexShrink: 0,
  },
  subtitle: { fontSize: 9, color: PDF_COLORS.muted },
  body: { marginTop: 3 },
});

function KlasikContactLine(props: { contacts: ContactView[] }) {
  return (
    <Text style={styles.contactLine}>
      {props.contacts.map((contact, index) => (
        <Text key={contact.kind}>
          {index > 0 ? "  ·  " : ""}
          {contact.href ? (
            <Link src={contact.href} style={styles.linkMuted}>
              {contact.value}
            </Link>
          ) : (
            contact.value
          )}
        </Text>
      ))}
    </Text>
  );
}

function KlasikHeader(props: { header: HeaderView }) {
  return (
    <View style={styles.header}>
      <Text style={styles.name}>{props.header.fullName}</Text>
      {props.header.headline ? (
        <Text style={styles.headline}>{props.header.headline}</Text>
      ) : null}
      {props.header.contacts.length > 0 ? (
        <KlasikContactLine contacts={props.header.contacts} />
      ) : null}
    </View>
  );
}

function KlasikExperience(props: { item: ExperienceItemView }) {
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
          <Link src={props.item.companyHref} style={styles.linkMuted}>
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

function KlasikEducation(props: { item: EducationItemView }) {
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

function KlasikCertificate(props: { item: CertificateItemView }) {
  const range = dateRange(props.item.startDate, props.item.endDate);
  return (
    <View>
      <View style={styles.entryRow}>
        <Text style={styles.entryTitle}>
          {props.item.href ? (
            <Link src={props.item.href} style={styles.linkMuted}>
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

function KlasikBlock(props: { block: ResumeBlock }) {
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
      return <PdfGrid items={block.items} />;
    case "languages":
      return <PdfGrid items={block.items} />;
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
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {blocks.map((block) => (
          <View
            key={block.id}
            style={{ marginTop: block.gapBefore }}
            minPresenceAhead={block.keepWithNext ? 48 : 0}
          >
            <KlasikBlock block={block} />
          </View>
        ))}
      </Page>
    </Document>
  );
}
