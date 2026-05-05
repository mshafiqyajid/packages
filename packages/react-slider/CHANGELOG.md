# @mshafiqyajid/react-slider

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

- b382828: Form-input contract parity (non-breaking):

  - `label`, `hint`, `error` slots, plus `invalid` and `required` flags.
  - `name?: string` — renders a `<input type="hidden">` for the current value so the slider posts via native form submission. Range mode emits two hidden inputs: `${name}` and `${name}-end`.
  - `id?: string` — overrides the wrapper id used for label association.
  - Track gains `aria-invalid`, `aria-required`, `aria-labelledby`, `aria-describedby` wiring.
  - Root lands `data-invalid="true"` when `invalid` or `error` is set; track active fill switches to the error color.
  - New CSS classes / tokens: `.rslider-label`, `.rslider-hint`, `.rslider-error`, `--rslider-label-fg`, `--rslider-hint-fg`, `--rslider-error-fg`. Dark-mode variants included.

## 0.1.0

### Minor Changes

- 9bb89cb: Initial public release of react-switch, react-badge, react-avatar, react-progress, react-slider, react-popover, react-dropdown-menu, and react-timeline
