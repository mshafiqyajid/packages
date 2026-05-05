# @mshafiqyajid/react-rich-text

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
