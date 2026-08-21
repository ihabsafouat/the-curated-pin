# Priority 8 — Article UX refinement

Priority 8 turns the rich block renderer into a long-form editorial reading experience optimized for Birthday content, internal navigation, Pinterest saves and conversion without adding another UI framework.

## What changed

- Sticky, active-section table of contents with mobile horizontal jump navigation.
- Article-relative reading progress instead of measuring the footer and unrelated page chrome.
- A compact action rail for native sharing, Pinterest saves, copy-link and the existing save workflow.
- Correct anchor IDs across the two article block segments around contextual lead magnets. This fixes a subtle issue where TOC links after the lead magnet could point at the wrong IDs.
- Sequential numbering for `idea` blocks across the full article, even when the lead magnet splits the render tree.
- Contextual lead-magnet placement after the second H2 section when possible, with the old proportional placement used only as a fallback.
- Native `<dialog>` gallery lightbox with previous/next controls; no heavyweight carousel/lightbox package added.
- Accessible horizontal tables with keyboard focus, swipe guidance and cell labels retained in the markup.
- FAQ expand/collapse-all controls while keeping native `<details>` semantics.
- Improved visual hierarchy for idea cards, editorial shopping picks, semantic next-step cards, save boxes and related guides.
- Mobile-specific ergonomics for long guides, including horizontal section chips and single-column content blocks.
- New `share_click` first-party analytics event with channel metadata. It is also eligible for consent-gated GA4 forwarding through the existing analytics client.

## Deliberate non-additions

- No new animation/UI dependency. Anime.js + Lenis already cover the interaction needs of this template.
- No autoplay sliders. They reduce control, add JS and are a poor fit for long-form editorial pages.
- No sticky affiliate banner. Monetization remains contextual so it does not overpower editorial intent or distort internal linking.
- No new image upload/compression system. That remains Priority 9, where MIME validation, resizing, modern formats and CDN delivery will be handled as one pipeline.

## Validation

Run:

```bash
npm ci
npm run setup:priority8
npm run check
npm run dev
```

Then manually test one long article at desktop, tablet and narrow mobile widths. Verify TOC anchors before and after a lead magnet, keyboard focus on tables, lightbox Escape/close behavior, share/copy actions, Pinterest destination, save actions and reduced-motion behavior.
