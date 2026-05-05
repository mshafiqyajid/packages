---
"@mshafiqyajid/react-rich-text": minor
---

Paste sanitization (non-breaking, scoped):

- Pasting from external sources (Word, Google Docs, web pages) now strips `style`, `class`, `on*` event handlers, and unknown tags. Allowed tag whitelist is configurable via `allowedTags`.
- `sanitizePaste` (default true) toggles the behavior.
- `transformPaste({ html, text }) => string` provides a full custom paste hook — bypasses the built-in sanitizer when set.
- Plain-text paste (no `text/html` on the clipboard) is HTML-escaped with newlines preserved as `<br>`.
- `<a href>` is preserved but `javascript:` / `data:` URLs are stripped.

Slash menus and image upload remain out of scope for this minor — they're better as a follow-up release.
