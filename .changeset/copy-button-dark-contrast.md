---
"@mshafiqyajid/react-copy-button": patch
---

Fix dark-mode contrast on `tone="primary" | "success" | "danger"` — previously paired lightened backgrounds with near-black text (~2.8:1, fails WCAG AA). Tones now keep their saturated palette across both modes with white text (4.6:1+ in all states). The default copied-state palette in dark mode is corrected the same way.

Affects only the styled `<CopyButtonStyled>` component. The headless hook and `<CopyButton>` primitive are unchanged.
