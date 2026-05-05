# @mshafiqyajid/react-number-input

## 1.1.1

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

## 1.1.0

### Minor Changes

- 321da95: Spinbutton polish (non-breaking):

  - `bigStep` option (default `step * 10`) used by Shift+ArrowUp/Down and PageUp/PageDown.
  - Home/End jump to `min` / `max` when those bounds are set.
  - Hold-to-repeat on the +/- stepper buttons (300 ms initial delay, 50 ms repeat).
  - Wheel scroll only adjusts the value when the input is actually focused — no more accidental nudges from page scrolling.
  - `wheelEnabled` opt-out for the wheel handler.
  - `inputMode` is now derived from precision (`"decimal"` when fractional, otherwise `"numeric"`) for a better mobile keyboard.
  - `aria-valuenow` reflects the clamped (committed) value rather than the raw input text.

## 1.0.0

### Major Changes

- 873a373: Align with cross-package form-control standard.

  **Breaking:**

  - Default md font-size is now 14px (was 15px); lg is 16px (was 17px). sm unchanged at 13px.
  - Heights unchanged at 32 / 40 / 48 px.
  - Border-radius now scales with size: 6 / 8 / 10 px (was a flat 8 px). Override via `--rni-radius-sm/md/lg`.
  - The root data-attribute for invalid state is now `data-invalid="true"` (was `data-error="true"`). Custom CSS targeting the old attribute must be updated.

  **Added:**

  - New props: `invalid`, `required`, `name`, `autoFocus`, `style` passthrough.
  - `aria-required` is now emitted when `required` is set.
  - New CSS variables: `--rni-radius-sm`, `--rni-radius-md`, `--rni-radius-lg`, `--rni-border-hover`, `--rni-bg-readonly`. The old single `--rni-radius` still works as a fallback.
  - Hover border darkens to `--rni-border-hover` when not disabled / readonly / focused.

## 0.1.3

### Patch Changes

- 949c5f6: Retry publish after npm rate limit resolved.

## 0.1.2

### Patch Changes

- ebce144: Retry publish — npm rate-limited on two previous attempts.

## 0.1.1

### Patch Changes

- 1df254b: Initial release (republish after npm rate limit during first attempt).

## 0.1.0

### Minor Changes

- 0aecafe: Initial release of 10 new packages: date-picker (single/range calendar), file-upload (drag-and-drop), number-input (decimal/currency/percent), phone-input (country selector + dial code), color-input (hex/rgb/hsl picker), tag-input (chips + autocomplete), rich-text (contentEditable WYSIWYG), table (sort/filter/paginate), chart (SVG bar/line/pie), kanban (HTML5 DnD board).
