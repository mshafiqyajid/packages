---
"@mshafiqyajid/react-copy-button": minor
---

Add `timeout` alias and `transform` callback to `useCopyToClipboard`.

- `timeout` — human-readable alias for `resetAfter` on both the hook and all components (`CopyButton`, `CopyButtonStyled`). When both are provided, `resetAfter` takes precedence.
- `transform` — `(text: string) => string | Promise<string>` option on the hook. Applied after the source resolves but before the clipboard write. `onCopy` receives the transformed result.
