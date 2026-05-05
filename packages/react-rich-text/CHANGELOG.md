# @mshafiqyajid/react-rich-text

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

- 321da95: Paste sanitization (non-breaking, scoped):

  - Pasting from external sources (Word, Google Docs, web pages) now strips `style`, `class`, `on*` event handlers, and unknown tags. Allowed tag whitelist is configurable via `allowedTags`.
  - `sanitizePaste` (default true) toggles the behavior.
  - `transformPaste({ html, text }) => string` provides a full custom paste hook — bypasses the built-in sanitizer when set.
  - Plain-text paste (no `text/html` on the clipboard) is HTML-escaped with newlines preserved as `<br>`.
  - `<a href>` is preserved but `javascript:` / `data:` URLs are stripped.

  Slash menus and image upload remain out of scope for this minor — they're better as a follow-up release.

## 0.1.0

### Minor Changes

- 0aecafe: Initial release of 10 new packages: date-picker (single/range calendar), file-upload (drag-and-drop), number-input (decimal/currency/percent), phone-input (country selector + dial code), color-input (hex/rgb/hsl picker), tag-input (chips + autocomplete), rich-text (contentEditable WYSIWYG), table (sort/filter/paginate), chart (SVG bar/line/pie), kanban (HTML5 DnD board).
