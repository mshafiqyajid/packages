# @mshafiqyajid/react-copy-button

## 0.2.1

### Patch Changes

- fc93c26: docs: sync README with current API surface (no code changes).

  The README is bundled into the npm tarball at publish time, so updates to README.md only reach npm with a republish. This patch-bump republishes 14 packages whose READMEs had drifted behind props/features that already shipped — so the npm package pages now match the current API.

  What's covered per package:

  - **number-input**: `bigStep`, `wheelEnabled`, hold-to-repeat, keyboard table.
  - **tag-input**: `pasteDelimiters`, `transform`, `backspaceEditsLastTag`; corrected `tagVariant` values (`subtle`, not `soft`).
  - **phone-input**: `preferredCountries`, `searchable`, `searchPlaceholder`, `disableCountrySelector`.
  - **color**: `presets`, `disabled`.
  - **color-input**: `presets`, `recentColors`, `onRecentColorsChange`, `recentColorsLimit`, `eyeDropper`, `format="hsl"`.
  - **progress**: `segments`, `formatValue`.
  - **avatar**: `autoColor`, `showLoading`.
  - **badge**: `maxCount`, `pulse`, `uppercase`, `hideOnZero`, `showZero`.
  - **copy-button**: `errorLabel`.
  - **rich-text**: `sanitizePaste`, `allowedTags`, `transformPaste`.
  - **file-upload**: full Props table (`variant`, `multiple`, `accept`, `maxSize`, `maxFiles`, `uploader`, `concurrency`, `autoUpload`, callbacks, `renderPreview`).
  - **switch**: full Props table including async-pending semantics.
  - **slider**: full Props table (`range`, `marks`, `transform`, etc.).
  - **toast**: Toast options table (`type`, `title`, `duration`, `action`, `id`).

## 0.2.0

### Minor Changes

- 321da95: Copy button polish (non-breaking):

  - `errorLabel` — label rendered when copy fails (mirrors `copiedLabel` for the success state).
  - `data-error="true"` lands on the button when an error is set, alongside the existing `data-copied="true"`. Style hooks for both states.

## 0.1.3

### Patch Changes

- 0d8d416: Add react-tooltip package; update npm homepage to docs site for all packages

## 0.1.2

### Patch Changes

- 99a05f0: Fix dark mode theme sync; remove prefers-color-scheme auto-detection

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
