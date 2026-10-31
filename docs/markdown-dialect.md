# Markdown dialect

The code mode shows a résumé as Markdown. This page gives the rules of that text. The
writer is `packages/resume/src/interchange/resume-md-write.ts`, the reader is
`resume-md-read.ts`, and the rules that the two share are in `resume-md-schema.ts`.
The reader parses with [comark](https://github.com/comarkdown/comark), which
`resume-md-nodes.ts` configures.

## What the text holds

The text holds the header and the sections. It does not hold the template, the font,
the spacing, the language, or the photo. The résumé keeps those as they are. Use YAML
or JSON in the code mode to edit a setting as text.

A section also keeps what the text does not show: if it is hidden, and the columns
and the proficiency switch of Skills and Languages.

## An example

```md
# Jane Doe

Job title: Senior Engineer
Email: jane@doe.dev
City: Jakarta

## Summary

Engineer with **eight years** in payments.

## Experience

### Senior Engineer

Company: Acme Inc.
Location: Jakarta, Indonesia
Dates: Jan 2023 - Present

- Cut p99 latency by 40 percent
- Led the [design system migration](https://acme.com/ds)

## Skills

- TypeScript: Advanced
- Go
```

## The header

- The `#` heading is the name. The last word is the last name, and the words before
  it are the first name. One word alone is the first name.
- If a name splits another way, the writer adds a `First name:` line and a
  `Last name:` line. Those lines win over the heading.
- The lines below the heading are labels: `Job title`, `Email`, `Phone`, `Website`,
  `LinkedIn`, `Link`, `City`, `Province`, and `Country`.
- Text above the first section that is not the name or a label goes to the summary.

## Sections

A `##` heading starts a section. The reader finds the type of the section in this
order:

1. A `{type=...}` attribute at the end of the heading.
2. The title, when it is the default title of a core section or its label in a
   résumé language: `Experience` and `Pengalaman` are both the experience section.
3. If the two steps above find nothing, the section is a custom section.

The title stays as written. `## Work History {type=experience}` is the experience
section with the title "Work History". The writer adds the attribute only when the
title does not name the type.

A custom section with `###` entries is a list. Without entries it is text. An empty
list writes `{variant=list}`, because nothing else shows its kind.

The reader takes braces for attributes only when each word in them is a `type` or a
`variant` that exists. Any other braces are part of the title.

## Entries

A `###` heading starts an entry. The heading is one field of the entry:

| Section                | The heading is  |
| ---------------------- | --------------- |
| Experience, Internship | the job title   |
| Projects               | the project     |
| Organizations          | the role        |
| Education              | the institution |
| Certifications         | the name        |
| A custom list          | the title       |

The first paragraph under the heading holds the labels, one on each line. A label is
the name of a field in the editor, such as `Company`, `Location`, `Company context`,
`Degree`, or `Issuer`. The key of a field is also a label, so `company:` and
`Company:` are the same.

- A line with a label of this section is a field.
- A line with no such label stays as text, in the body of the entry.
- The blocks after that paragraph are the body: paragraphs, bullet lists, and
  numbered lists.
- `### -` is an entry with no title. An empty heading is not a heading in Markdown.

### Dates

`Dates: Jan 2023 - Present` holds the start date and the end date. The reader also
takes an en dash or an em dash. The writer uses `Start date:` and `End date:` when one
date is empty or when the start date has " - " in it.

## Skills and languages

Each skill or language is one list line: `- TypeScript: Advanced`, or `- Go` with no
level. The text before the first ": " is the name.

A name that a line cannot hold takes the entry form. A name is such a name when it is
empty or when it has ": " in it:

```md
### Design: Figma

Proficiency: Advanced
```

## Rich text

A body holds paragraphs, bullet lists, numbered lists, `**bold**`, `*italic*`, and
`[links](https://example.com)`. This is the same set as the editor.

Other Markdown is not available, and its text stays as the person typed it:

| Input                                      | Result                              |
| ------------------------------------------ | ----------------------------------- |
| A table, a quote, a code block, a rule     | Text                                |
| HTML, an image, inline code                | Text                                |
| `####` and deeper headings                 | A paragraph                         |
| A list in a list                           | The inner items join the outer list |
| A line break in a paragraph                | A space                             |
| A link with a scheme such as `javascript:` | Text                                |
| A bare address such as `acme.com`          | A link to `https://acme.com`        |

## Text with no field

Some sections have no body: Certifications, Skills, and Languages. A paragraph in an
entry of such a section has no field, so the résumé does not keep it. The line under
the code says how many blocks are left out.

## The round trip

The Markdown of a résumé reads back as that same résumé. The writer escapes the
characters that have a meaning (`\`, `*`, `[`, `]`, and `_` at the edge of a word),
and a line that looks like a heading or a list item gets a backslash before its
marker.

`pnpm validate:exports` runs this check on both samples and on a hard case
(`apps/web/scripts/markdown-checks.ts`). It also counts the headings of the sample
that carry an attribute. If more than one in four carries one, the check fails:
that is the kill criterion of the RFC (#142).

## comark

- The reader turns off the default plugins of comark. Those plugins read frontmatter,
  HTML, and components, and a résumé holds none of them.
- The attributes plugin of comark is also off. It takes any `{braces}` in a line for
  attributes and drops them from the text. The reader reads the attributes of a
  section heading itself.
- comark keeps a link as typed. Its default changes a link to its percent-encoded
  form.
- comark loads when the first Markdown text is read, so YAML and JSON never load it.
