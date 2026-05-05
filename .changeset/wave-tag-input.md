---
"@mshafiqyajid/react-tag-input": minor
---

Tag input polish (non-breaking):

- Paste-multi-tag splitting — pasting `"foo, bar, baz"` (or newline/tab/semicolon-separated) now adds three tags. Customize via `pasteDelimiters: (string | RegExp)[]`. Pass `null` to disable.
- `transform: (raw) => string` runs before validation (great for `tag => tag.toLowerCase()`).
- `backspaceEditsLastTag` — when input is empty, Backspace pulls the last tag back into the input for editing instead of just removing it.
- Hidden form inputs — when `name` is set, the styled component now renders `<input type="hidden" name="${name}">` for **each** tag (so the form posts the tag list, not the typed text).
- `addTags(tags: string[])` programmatic helper on `useTagInput`.
