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
  name: { fontSize: 22, fontWeight: 700, lineHeight: 1.2 },
  headline: {
    marginTop: 2,
    fontSize: 10.5,
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
  linkPlain: { color: PDF_COLORS.foreground, textDecoration: "none" },
  heading: {
    borderTopWidth: 2,
    borderTopColor: PDF_COLORS.foreground,
    paddingTop: 3,
  },
  headingText: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  entryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 8,
  },
  entryTitle: { fontSize: 10, fontWeight: 700 },
  entryDate: {
    fontSize: 9,
    fontWeight: 600,
    color: PDF_COLORS.muted,
    flexShrink: 0,
  },
  subtitle: { fontSize: 9, fontWeight: 600, color: PDF_COLORS.muted },
  subtitleLink: { color: PDF_COLORS.muted, textDecoration: "none" },
  body: { marginTop: 3 },
});

function TebalHeader(props: { header: HeaderView }) {
  return (
    <View>
      <Text style={styles.name}>{props.header.fullName}</Text>
      {props.header.headline ? (
        <Text style={styles.headline}>{props.header.headline}</Text>
      ) : null}
      {props.header.contacts.length > 0 ? (
        <View style={styles.contactRowWrap}>
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
      ) : null}
    </View>
  );
}

function TebalExperience(props: { item: ExperienceItemView }) {
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

function TebalEducation(props: { item: EducationItemView }) {
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

function TebalCertificate(props: { item: CertificateItemView }) {
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

function TebalBlock(props: { block: ResumeBlock }) {
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
      return <PdfGrid items={block.items} />;
    case "languages":
      return <PdfGrid items={block.items} />;
  }
}

/**
 * "Tebal" as a react-pdf document: bold modern hierarchy with thick heading
 * rules. Consumes the same linear `buildResumeBlocks` sequence as every
 * template, so reading order and extraction are identical.
 */
export function TebalPdfDocument(props: { preview: ResumePreview }) {
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
            <TebalBlock block={block} />
          </View>
        ))}
      </Page>
    </Document>
  );
}
