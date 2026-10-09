---
name: ste
description: >-
  Rewrite and check technical writing to follow Simplified Technical English
  (ASD-STE100). Use when asked to simplify docs, rewrite in STE / plain
  technical English, write clear procedures or warnings, or flag hard-to-read
  or ambiguous technical text for a global / non-native audience.
---

# Simplified Technical English (ASD-STE100)

Simplified Technical English (STE) is a controlled language for technical
documentation. It exists so that procedures, manuals, and warnings can be
read the same way by every reader — including non-native English speakers.
Its two halves are a **set of writing rules** and a **controlled vocabulary**
(one word, one meaning, one part of speech).

Use this skill to do one of two jobs — ask which if it is unclear:

- **Rewrite** — turn source text into STE.
- **Check** — flag violations in existing text and explain each one.

STE is designed for **procedures, descriptions, warnings, and cautions**. It
is *not* for marketing copy, narrative prose, or legal text — say so if asked
to apply it there.

## The rules that matter most

Apply these in order. The first four fix the majority of problems.

1. **One idea per sentence.** For procedures, write **one instruction per
   sentence**. Split compound instructions into separate steps.
2. **Keep sentences short.** Procedural sentences: **20 words max**.
   Descriptive sentences: **25 words max**. Paragraphs: **6 sentences max**.
3. **Use the active voice.** In procedures, use the **imperative** ("Open the
   valve"), not the passive ("The valve should be opened").
4. **Use simple verb tenses.** Present, past, or future only. Avoid the
   `-ing` form (no present participle / gerund) and avoid perfect tenses.
5. **One word, one meaning.** Use the same word for the same thing every
   time. Do not use synonyms for variety ("start" everywhere, never also
   "initiate", "activate", "begin"). Do not use one word for two meanings.
6. **Keep the articles and connectors.** Do not drop `the`, `a`, `that`, or
   `which` to save words. They prevent ambiguity ("Remove displays" → "Remove
   the displays").
7. **Prefer short, common, approved words.** Choose the simplest word that
   works: "use" not "utilize", "about" not "approximately", "do" not
   "perform", "before" not "prior to".
8. **Be specific — no vague pronouns or noun clusters.** Avoid strings of
   three or more nouns ("runway light connection resistance"). Break them up
   with prepositions. Replace vague "it"/"this" with the actual noun.
9. **Warnings and cautions first.** Put the safety instruction (the command)
   **first**, then the reason: "Do not touch the wire. It is live." not
   "Because the wire is live, you must not touch it."
10. **Use lists for conditions and sequences.** When several conditions or
    steps pile up in one sentence, break them into a vertical list.

## Rewrite workflow

1. **Read for intent** — know what the text tells the reader to do or know.
2. **Split** — one sentence per instruction or per fact.
3. **Convert to imperative / active** for every instruction.
4. **Shorten** — cut fillers, fix tense, drop `-ing`, respect the word limit.
5. **Normalize terms** — pick one term per concept and use it throughout.
6. **Reorder warnings** — command first, reason second.
7. **Re-read as a non-native speaker** — anything ambiguous gets rewritten.

Preserve the source's technical meaning exactly. If simplifying would change
or drop a technical detail, keep the detail and flag the tension instead.

## Check workflow

When asked to check (not rewrite), report each issue as:

```
[line/quote] — <rule broken> — <why it's a problem> — <suggested fix>
```

Group by severity: ambiguity and safety issues first, then readability.
Do not rewrite the whole text unless asked; give targeted fixes.

## Examples

**Wordy passive → imperative, split, shortened**

- ✗ "It should be ensured that the power supply has been disconnected before
  any attempt is made to remove the cover, as failure to do so may result in
  a risk of electric shock."
- ✓ "Warning: Electric shock can kill you. Disconnect the power supply. Then
  remove the cover."

**Synonyms and vague terms → consistent, specific**

- ✗ "Initiate the pump, then verify the unit is operational and monitor it."
- ✓ "Start the pump. Make sure that the pump operates. Look at the pump."

**Noun cluster → prepositions**

- ✗ "Check the runway light connection resistance value."
- ✓ "Check the resistance of the connection for the runway light."

**Dropped articles → restored**

- ✗ "Remove access panel and disconnect battery cable."
- ✓ "Remove the access panel. Disconnect the battery cable."

## Notes and limits

- The official ASD-STE100 dictionary of approved words is copyrighted and not
  reproduced here. Apply the *principles* above; when in doubt, choose the
  simplest common English word and use it consistently.
- STE limits vocabulary on purpose. If a needed **technical name** or
  **technical verb** is not a "plain" word (e.g. "calibrate", "solder"), that
  is allowed — STE permits approved technical terms. Do not dumb these down.
- When you finish a rewrite, offer a short note of what changed (e.g. "split
  into 4 steps, removed passive voice, standardized 'start'").
