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
    paddingVertical: 40,
    paddingHorizontal: 44,
    fontFamily: "Inter",
    fontSize: 9,
    color: PDF_COLORS.foreground,
    lineHeight: 1.4,
  },
  name: {
    fontFamily: "GeistMono",
    fontSize: 16,
    fontWeight: 700,
    lineHeight: 1.25,
  },
  headline: {
    marginTop: 2,
    fontFamily: "GeistMono",
    fontSize: 10,
    color: PDF_COLORS.muted,
  },
  contactLine: {
    marginTop: 4,
    fontFamily: "GeistMono",
    fontSize: 8,
    color: PDF_COLORS.muted,
  },
  linkMuted: { color: PDF_COLORS.muted, textDecoration: "none" },
  heading: {
    fontFamily: "GeistMono",
    fontSize: 9.5,
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
  entryTitle: { fontFamily: "GeistMono", fontSize: 9, fontWeight: 700 },
  entryDate: {
    fontFamily: "GeistMono",
    fontSize: 8,
    color: PDF_COLORS.muted,
    flexShrink: 0,
  },
  subtitle: { fontSize: 9, color: PDF_COLORS.muted },
  body: { marginTop: 3 },
});

function KetikContactLine(props: { contacts: ContactView[] }) {
  return (
    <Text style={styles.contactLine}>
      {props.contacts.map((contact, index) => (
        <Text key={contact.kind}>
          {index > 0 ? " | " : ""}
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

function KetikHeader(props: { header: HeaderView }) {
  return (
    <View>
      <Text style={styles.name}>{props.header.fullName}</Text>
      {props.header.headline ? (
        <Text style={styles.headline}>{props.header.headline}</Text>
      ) : null}
      {props.header.contacts.length > 0 ? (
        <KetikContactLine contacts={props.header.contacts} />
      ) : null}
    </View>
  );
}

function KetikExperience(props: { item: ExperienceItemView }) {
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

function KetikEducation(props: { item: EducationItemView }) {
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

function KetikCertificate(props: { item: CertificateItemView }) {
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

function KetikBlock(props: { block: ResumeBlock }) {
  const { block } = props;
  switch (block.kind) {
    case "header":
      return <KetikHeader header={block.header} />;
    case "heading":
      return <Text style={styles.heading}>{block.title}</Text>;
    case "summary":
      return <PdfRichText blocks={block.body} />;
    case "experience":
      return <KetikExperience item={block.item} />;
    case "education":
      return <KetikEducation item={block.item} />;
    case "certificate":
      return <KetikCertificate item={block.item} />;
    case "skills":
      return <PdfGrid items={block.items} />;
    case "languages":
      return <PdfGrid items={block.items} />;
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
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {blocks.map((block) => (
          <View
            key={block.id}
            style={{ marginTop: block.gapBefore }}
            minPresenceAhead={block.keepWithNext ? 48 : 0}
          >
            <KetikBlock block={block} />
          </View>
        ))}
      </Page>
    </Document>
  );
}
