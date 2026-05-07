# @mshafiqyajid/react-badge

## 0.2.3

### Patch Changes

- 1d51e50: fix(badge): `hideOnZero` now hides the count element even when the badge has other content (children, icon, or dot).

  Previously `hideOnZero` only removed the entire badge when there was no other content. A badge with children _and_ `count={0}` still rendered the "0" count. The count element now respects `hideOnZero` independently of the badge itself.

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

- 321da95: Badge polish (non-breaking):

  - `hideOnZero` — hide the badge entirely when `count` is 0 and there's no other content (no children, no icon, no dot). Default false.
  - `showZero` — keep zero counts visible even when `hideOnZero` is set elsewhere (useful for cart-item-count style badges that prefer "0" over an empty space).

## 0.1.0

### Minor Changes

- 9bb89cb: Initial public release of react-switch, react-badge, react-avatar, react-progress, react-slider, react-popover, react-dropdown-menu, and react-timeline
