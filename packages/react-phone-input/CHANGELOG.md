# @mshafiqyajid/react-phone-input

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

- 321da95: Country selector polish (non-breaking):

  - Searchable country list — typing in the dropdown filters by name / ISO code / dial code. `searchable` (default true) and `searchPlaceholder` props.
  - `preferredCountries: string[]` — render these ISO2 codes at the top of the list, separated from the rest by a divider.
  - `disableCountrySelector` — lock the picker to the current country (still surfaces dial code, but no dropdown).
  - New CSS classes / hooks: `.rphi-search`, `.rphi-divider`, `.rphi-empty`, `[data-locked]`. Dark-mode tokens included.

## 1.0.0

### Major Changes

- 873a373: Align with cross-package form-control standard.

  **Breaking:**

  - Default sm font-size is now 13px (was 12.8px). md (14px) and lg (16px) unchanged.
  - Border-radius now scales with size: 6 / 8 / 10 px (was a flat 8 px). Override via `--rphi-radius-sm/md/lg`.
  - Heights unchanged at 32 / 40 / 48 px.

  **Added:**

  - New props: `invalid`, `required`, `readOnly`, `id`, `name`, `autoFocus`, `placeholder`, `style` passthrough.
  - Root now exposes `data-invalid` and `data-readonly` attributes.
  - New CSS variables: `--rphi-radius-sm/md/lg`, `--rphi-border-hover`, `--rphi-bg-readonly`, `--rphi-shadow-focus`, `--rphi-error-border`, `--rphi-error-shadow`, `--rphi-ease`. Old `--rphi-radius` continues to work as a fallback.
  - Hover border darkens to `--rphi-border-hover` when not disabled / readonly / focused.
  - `aria-required` is now emitted when `required` is set.

## 0.1.0

### Minor Changes

- 0aecafe: Initial release of 10 new packages: date-picker (single/range calendar), file-upload (drag-and-drop), number-input (decimal/currency/percent), phone-input (country selector + dial code), color-input (hex/rgb/hsl picker), tag-input (chips + autocomplete), rich-text (contentEditable WYSIWYG), table (sort/filter/paginate), chart (SVG bar/line/pie), kanban (HTML5 DnD board).
