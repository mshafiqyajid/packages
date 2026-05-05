# @mshafiqyajid/react-tag-input

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

- 321da95: Tag input polish (non-breaking):

  - Paste-multi-tag splitting — pasting `"foo, bar, baz"` (or newline/tab/semicolon-separated) now adds three tags. Customize via `pasteDelimiters: (string | RegExp)[]`. Pass `null` to disable.
  - `transform: (raw) => string` runs before validation (great for `tag => tag.toLowerCase()`).
  - `backspaceEditsLastTag` — when input is empty, Backspace pulls the last tag back into the input for editing instead of just removing it.
  - Hidden form inputs — when `name` is set, the styled component now renders `<input type="hidden" name="${name}">` for **each** tag (so the form posts the tag list, not the typed text).
  - `addTags(tags: string[])` programmatic helper on `useTagInput`.

## 1.0.0

### Major Changes

- 873a373: Align with cross-package form-control standard.

  **Breaking:**

  - Wrapper now has explicit `min-height` per size: 32 / 40 / 48 px (sm / md / lg). Override with `--rti-min-height-sm/md/lg`. The empty wrapper now matches sibling form inputs (number, phone, color, otp) in a form row.
  - Default sm font-size now 13px (was 12px). md (14) and lg (16) unchanged.
  - Border-radius now scales with size: 6 / 8 / 10 px (was a flat 6 px). Override with `--rti-radius-sm/md/lg`.
  - Wrapper also exposes `data-invalid="true"` (the existing `data-error="true"` is still emitted for back-compat). Custom CSS should target `[data-invalid="true"]` going forward.

  **Added:**

  - New props: `invalid`, `required`, `readOnly`, `id`, `name`, `autoFocus`, `style` passthrough on root.
  - Root and wrapper now expose `data-invalid` and `data-readonly` attributes.
  - Hover border darkens to `--rti-wrapper-border-hover` when not disabled / readonly / focused.
  - Read-only state available via `readOnly` prop and `[data-readonly="true"]` selector.
  - New CSS variables: `--rti-min-height-sm/md/lg`, `--rti-radius-sm/md/lg`, `--rti-wrapper-border-hover`, `--rti-bg-readonly`, `--rti-error-border`, `--rti-error-shadow`, `--rti-ease`.
  - `aria-required` and `aria-invalid` are now emitted on the inner input when those props are set.

## 0.1.0

### Minor Changes

- 0aecafe: Initial release of 10 new packages: date-picker (single/range calendar), file-upload (drag-and-drop), number-input (decimal/currency/percent), phone-input (country selector + dial code), color-input (hex/rgb/hsl picker), tag-input (chips + autocomplete), rich-text (contentEditable WYSIWYG), table (sort/filter/paginate), chart (SVG bar/line/pie), kanban (HTML5 DnD board).
