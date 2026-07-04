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
    fontFamily: "Inter",
    fontSize: 9,
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
    fontSize: 18,
    textTransform: "uppercase",
    lineHeight: 1.25,
  },
  headline: {
    marginTop: 1,
    fontFamily: "Lora",
    fontSize: 10,
    color: PDF_COLORS.muted,
  },
  contactLine: { marginTop: 3, fontSize: 9, color: PDF_COLORS.muted },
  linkMuted: { color: PDF_COLORS.muted, textDecoration: "none" },
  heading: {
    fontFamily: "Lora",
    fontSize: 9.5,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  entryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 8,
  },
  entryTitle: { fontSize: 9.5, textTransform: "uppercase" },
  entryDate: { fontSize: 9, color: PDF_COLORS.muted, flexShrink: 0 },
  subtitle: { fontSize: 9, fontStyle: "italic", color: PDF_COLORS.muted },
  body: { marginTop: 3 },
});

function LuasaContactLine(props: { contacts: ContactView[] }) {
  return (
    <Text style={styles.contactLine}>
      {props.contacts.map((contact, index) => (
        <Text key={contact.kind}>
          {index > 0 ? "  •  " : ""}
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

function LuasaHeader(props: { header: HeaderView }) {
  return (
    <View style={styles.accentBar}>
      <Text style={styles.name}>{props.header.fullName}</Text>
      {props.header.headline ? (
        <Text style={styles.headline}>{props.header.headline}</Text>
      ) : null}
      {props.header.contacts.length > 0 ? (
        <LuasaContactLine contacts={props.header.contacts} />
      ) : null}
    </View>
  );
}

function LuasaExperience(props: { item: ExperienceItemView }) {
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

function LuasaEducation(props: { item: EducationItemView }) {
  return (
    <View style={styles.softBar}>
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

function LuasaCertificate(props: { item: CertificateItemView }) {
  const range = dateRange(props.item.startDate, props.item.endDate);
  return (
    <View style={styles.softBar}>
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

function LuasaBlock(props: { block: ResumeBlock }) {
  const { block } = props;
  switch (block.kind) {
    case "header":
      return <LuasaHeader header={block.header} />;
    case "heading":
      return <Text style={styles.heading}>{block.title}</Text>;
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
      return <PdfGrid items={block.items} />;
    case "languages":
      return <PdfGrid items={block.items} />;
  }
}

/**
 * "Luasa" as a react-pdf document: airy minimalist layout with slim accent bars
 * and letterspaced headings. Consumes the same linear `buildResumeBlocks`
 * sequence as every template, so reading order and extraction are identical.
 */
export function LuasaPdfDocument(props: { preview: ResumePreview }) {
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
            <LuasaBlock block={block} />
          </View>
        ))}
      </Page>
    </Document>
  );
}
