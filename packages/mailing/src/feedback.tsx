import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "react-email";
import { EMAIL_COLORS, EMAIL_FONTS } from "./theme";

interface Fact {
  label: string;
  value: string;
}

interface Answer {
  heading: string;
  text: string;
  /** The text quotes the app's copy, so it shows as a quotation. */
  quoted?: boolean;
}

interface FeedbackEmailProps {
  /** The title of the GitHub issue. */
  title: string;
  labels: ReadonlyArray<string>;
  /** The address of the issue on GitHub. */
  url: string;
  /** The reporter's name, empty for an anonymous report. */
  sender: string;
  /** The choices of the report, such as its area. */
  facts: ReadonlyArray<Fact>;
  answers: ReadonlyArray<Answer>;
  /** The technical details, empty when the reporter left them out. */
  details: ReadonlyArray<Fact>;
}

const LABEL_STYLE = {
  color: EMAIL_COLORS.mutedForeground,
  fontFamily: EMAIL_FONTS.mono,
  fontSize: "12px",
  letterSpacing: "0.04em",
  lineHeight: "18px",
  margin: "0 0 4px",
};

const VALUE_STYLE = {
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 16px",
  whiteSpace: "pre-wrap" as const,
};

const QUOTE_STYLE = {
  ...VALUE_STYLE,
  borderLeft: `3px solid ${EMAIL_COLORS.border}`,
  color: EMAIL_COLORS.mutedForeground,
  paddingLeft: "12px",
};

const CARD_STYLE = {
  backgroundColor: EMAIL_COLORS.card,
  border: `1px solid ${EMAIL_COLORS.border}`,
  borderRadius: "12px",
  padding: "20px 24px 4px",
};

function AnswerBlock(props: { answer: Answer }) {
  const answer = props.answer;
  return (
    <>
      <Text style={LABEL_STYLE}>{answer.heading}</Text>
      <Text style={answer.quoted ? QUOTE_STYLE : VALUE_STYLE}>
        {answer.text}
      </Text>
    </>
  );
}

function FactRow(props: { fact: Fact }) {
  return (
    <Row>
      <Column style={{ ...LABEL_STYLE, padding: "0 16px 8px 0", width: "40%" }}>
        {props.fact.label}
      </Column>
      <Column
        style={{ fontSize: "14px", lineHeight: "20px", padding: "0 0 8px" }}
      >
        {props.fact.value}
      </Column>
    </Row>
  );
}

/** Tells the maintainer that the feedback form filed a new issue. */
export function FeedbackEmail(props: FeedbackEmailProps) {
  const from = props.sender ? `From ${props.sender}` : "Sent anonymously";

  return (
    <Html lang="en">
      <Head />
      <Preview>{props.title}</Preview>
      <Body
        style={{
          backgroundColor: EMAIL_COLORS.background,
          color: EMAIL_COLORS.foreground,
          fontFamily: EMAIL_FONTS.sans,
          margin: 0,
          padding: "40px 16px",
        }}
      >
        <Container style={{ maxWidth: "560px", margin: "0 auto" }}>
          <Text style={{ ...LABEL_STYLE, margin: "0 0 16px" }}>
            lanjut.org · feedback form
          </Text>

          <Heading
            as="h1"
            style={{
              fontSize: "24px",
              fontWeight: 700,
              letterSpacing: "-0.01em",
              lineHeight: "32px",
              margin: "0 0 8px",
            }}
          >
            {props.title}
          </Heading>
          <Text
            style={{
              color: EMAIL_COLORS.mutedForeground,
              fontSize: "14px",
              lineHeight: "22px",
              margin: "0 0 24px",
            }}
          >
            {from} · {props.labels.join(" · ")}
          </Text>

          <Section style={CARD_STYLE}>
            <Section style={{ padding: "0 0 8px" }}>
              {props.facts.map((fact) => (
                <FactRow key={fact.label} fact={fact} />
              ))}
            </Section>
            <Hr
              style={{ borderColor: EMAIL_COLORS.border, margin: "0 0 16px" }}
            />
            {props.answers.map((answer) => (
              <AnswerBlock key={answer.heading} answer={answer} />
            ))}
          </Section>

          {props.details.length > 0 && (
            <Section style={{ ...CARD_STYLE, margin: "16px 0 0" }}>
              <Text style={{ ...LABEL_STYLE, margin: "0 0 12px" }}>
                Technical details
              </Text>
              <Section style={{ padding: "0 0 8px" }}>
                {props.details.map((fact) => (
                  <FactRow key={fact.label} fact={fact} />
                ))}
              </Section>
            </Section>
          )}

          <Section style={{ padding: "24px 0 0" }}>
            <Button
              href={props.url}
              style={{
                backgroundColor: EMAIL_COLORS.primary,
                borderRadius: "8px",
                color: EMAIL_COLORS.primaryForeground,
                fontSize: "14px",
                fontWeight: 500,
                padding: "10px 18px",
              }}
            >
              Open the issue on GitHub
            </Button>
          </Section>

          <Text
            style={{
              color: EMAIL_COLORS.mutedForeground,
              fontSize: "13px",
              lineHeight: "20px",
              margin: "32px 0 0",
            }}
          >
            The feedback form filed this issue with your GitHub account, so
            GitHub sent you no notification of its own.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
