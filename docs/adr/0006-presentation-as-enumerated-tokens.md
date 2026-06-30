# Presentation is an enumerated token set in the renderer intersection

Presentation is a fixed, enumerated set of Presentation tokens (fontFamily from a curated embeddable-TTF list, discrete fontScale, density presets, a single constrained accentColor, a small headingStyle enum, discrete page size/margins) — not free-form CSS. Every token must be expressible in both the HTML editing canvas and `@react-pdf`. Themes are code-defined presets that populate tokens; the user tweaks token values from there. No per-element style overrides, no custom CSS, no user-saved themes in v1.

## Why

- `@react-pdf` supports only a flexbox subset and embedded TTF fonts. A token that the PDF exporter can't honor would break preview-equals-output. Constraining tokens to the renderer intersection keeps the dual-render guarantee (ADR-0005) true.
- Per-element overrides and custom CSS are structural freedom in disguise — they would let users build layouts that defeat ATS parsing. The constraint is the product.

## Consequences

- Tokens live in the Resume `presentation` block and migrate via the same schemaVersion ladder as structural content.
- Users expecting Canva-style freedom are intentionally not served; this is an ATS builder.
- Curated fonts must be shipped as TTFs and registered with both `@react-pdf` and `@font-face`.
