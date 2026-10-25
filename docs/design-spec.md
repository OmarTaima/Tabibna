# Design specification — VivaValve

The full working design spec lives in the team conversation. Core constraints:

- Calm, clinical, bilingual-first. No chatbot, dashboard, or AI-magic cues.
- Teal `#0F766E`, ink `#162220`, page `#F7FAF9`, white cards, border `#E3EAE7`, muted `#55645F`.
- Manrope headings, Inter body, IBM Plex Sans Arabic for Arabic. Arabic line-height 1.8+; no tracking, italics, or uppercase.
- Shell max 1120px; results max 880px. Form is not inside a chat-like card.
- Cards 16px radius, 1px border, 24px padding. Buttons/inputs 12px radius. Minimal shadows.
- No gradients, large illustrations, charts, chat bubbles, sparkles, or diagnostic framing.
- Support English LTR and Arabic RTL with logical layout utilities.
- Accessible focus, labels, live regions, 44px+ touch targets. Reduced motion respected.
- Loading, invalid, API-error, empty, success, copy-success, and print states.
- Print report is A4, bilingual, with Arabic RTL preserved and no split safety/summary cards.
