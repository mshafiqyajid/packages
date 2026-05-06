# @mshafiqyajid/react-switch

## 0.2.2

### Patch Changes

- 79ea049: Add a `style?: CSSProperties` prop to five components for symmetry with the rest of the family. All apply to the root element and merge cleanly with the package's internal styling — no behaviour change, no defaults shifted.

  - `AccordionStyled`
  - `BadgeStyled`
  - `CheckboxStyled`
  - `SwitchStyled`
  - `ToastProvider` (also gains a `className` prop for the portal region — useful for one-off offsets like `style={{ marginTop: 80 }}` to clear a sticky header).

  `ModalStyled` and `CommandPaletteStyled` are intentionally left as `className`-only — they portal-render multiple slots (overlay + panel), where a single top-level `style` would be ambiguous. CSS variables remain the design surface there.

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

- f8ca726: Async toggle support (non-breaking):

  - `onChange` may now return a `Promise<void>`. While the promise is in flight, the switch shows the spinner thumb (sets `data-loading="true"` + `data-pending="true"`), reports `aria-busy="true"`, and ignores further clicks.
  - If the promise rejects, the optimistic checked state is reverted automatically (uncontrolled mode) — controlled callers continue to manage their own state.
  - New result field on `useSwitch`: `isPending`. The existing `loading` prop still works to force the spinner regardless of any in-flight promise.

## 0.1.0

### Minor Changes

- 9bb89cb: Initial public release of react-switch, react-badge, react-avatar, react-progress, react-slider, react-popover, react-dropdown-menu, and react-timeline
