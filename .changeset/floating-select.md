---
"@mshafiqyajid/react-select": minor
---

Floating-UI parity (non-breaking):

- New props: `placement` (`"auto" | "top" | "bottom"`, default `"auto"`), `offset` (default 4), `collisionPadding` (default 8), `flip` (default true), `strategy` (`"absolute"` | `"fixed"`).
- The listbox now lands `data-placement="top" | "bottom"` reflecting the resolved side, so consumers can flip arrow direction or radius.
- Exports `SelectPlacement` and `SelectStrategy` types.
- Note: select keeps width tied to the trigger width — left/right placements aren't applicable.
