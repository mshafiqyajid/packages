# @mshafiqyajid/react-copy-button

## 0.1.1

### Patch Changes

- af97b11: Fix dark-mode contrast on `tone="primary" | "success" | "danger"` — previously paired lightened backgrounds with near-black text (~2.8:1, fails WCAG AA). Tones now keep their saturated palette across both modes with white text (4.6:1+ in all states). The default copied-state palette in dark mode is corrected the same way.

  Affects only the styled `<CopyButtonStyled>` component. The headless hook and `<CopyButton>` primitive are unchanged.

## 0.1.0

### Minor Changes

- c4b50f5: Initial public release.

  - `useCopyToClipboard()` headless hook with copy/copied/error/reset.
  - `<CopyButton>` headless primitive with render-prop support.
  - `<CopyButtonStyled>` polished component with variants (solid / outline / ghost / subtle), sizes (sm / md / lg / icon), tones (neutral / primary / success / danger), animated copied state, async loading spinner, tooltip, custom icons, full a11y.
  - Themable via CSS variables, dark-mode aware, respects `prefers-reduced-motion`.
  - ESM + CJS, full TypeScript types, zero dependencies, SSR-safe.
