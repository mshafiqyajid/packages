# @mshafiqyajid/react-color-input

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

- 321da95: Recent colors (non-breaking):

  - `recentColors: string[]` — controlled list rendered as a row above the presets in the popover. Auto-tracks the last N committed colors when uncontrolled.
  - `onRecentColorsChange(colors)` — fires whenever the list changes (most recent first, deduped).
  - `recentColorsLimit: number` (default 12) — caps the recent strip.

## 1.0.0

### Major Changes

- 873a373: Align with cross-package form-control standard.

  **Breaking:**

  - Field heights bumped: sm 30→32px, md 36→40px, lg 42→48px. Override with `--rci-h-sm/md/lg`.
  - Inner swatch sized up to keep proportion: sm 22 (unchanged), md 26→28, lg 30→34. Override with `--rci-swatch-sm/md/lg`.
  - Default sm font-size now 13px (was 12px). md (14) and lg (16) unchanged.
  - Border-radius now scales with size: 6 / 8 / 10 px (was a flat 6 px). Override with `--rci-radius-sm/md/lg`.
  - Disabled opacity changed from 0.7 to 0.55 (matches other form inputs).

  **Added:**

  - New props: `readOnly`, `required`, `invalid`, `id`, `name`, `autoFocus`, `placeholder`, `style` passthrough.
  - Root now exposes `data-size`, `data-tone`, `data-disabled`, `data-readonly`, `data-invalid` attributes for CSS targeting.
  - Hover border darkens to `--rci-border-hover` when not disabled / readonly / focused.
  - New CSS variables: `--rci-radius-sm/md/lg`, `--rci-border-hover`, `--rci-bg-readonly`, `--rci-shadow-focus`, `--rci-error-border`, `--rci-error-shadow`, `--rci-popover-radius`.
  - `aria-required` is now emitted when `required` is set.

## 0.1.0

### Minor Changes

- 0aecafe: Initial release of 10 new packages: date-picker (single/range calendar), file-upload (drag-and-drop), number-input (decimal/currency/percent), phone-input (country selector + dial code), color-input (hex/rgb/hsl picker), tag-input (chips + autocomplete), rich-text (contentEditable WYSIWYG), table (sort/filter/paginate), chart (SVG bar/line/pie), kanban (HTML5 DnD board).
