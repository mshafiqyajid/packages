---
"@mshafiqyajid/react-rich-text": minor
---

Six additive feature areas for `react-rich-text`:

- **Keyboard shortcuts** — `shortcuts?: boolean | ShortcutMap` (default `true`). Built-ins: `Mod+B` bold, `Mod+I` italic, `Mod+U` underline, `Mod+K` link. `Mod` resolves to Cmd on Mac, Ctrl elsewhere. Pass `false` to disable, or a partial map to override individual actions. Browser default is suppressed so formatting doesn't double-fire.
- **Inline link popover** — `defaultLinkPrompt?: "popover" | "prompt"` (default `"popover"`) replaces the old `window.prompt` flow. The built-in popover supports a URL field, an "Open in new tab" toggle, and Edit / Remove actions when re-opened on an existing link. `renderLinkPrompt?: (args) => ReactNode` allows full custom UI. New CSS classes `.rrt2-link-popover`, `.rrt2-link-popover-input`, `.rrt2-link-popover-actions` and tokens `--rrt2-popover-bg`, `--rrt2-popover-fg`, `--rrt2-popover-border`, `--rrt2-popover-shadow`, `--rrt2-popover-radius`.
- **Floating bubble menu** — `bubbleMenu?: boolean | { items?: ToolbarItem[]; offset?: number }` shows a small toolbar above non-empty selections (auto-flips below if no room). Portaled to `document.body`. New CSS classes `.rrt2-bubble`, `.rrt2-bubble-btn` and tokens `--rrt2-bubble-bg`, `--rrt2-bubble-fg`, `--rrt2-bubble-btn-bg-hover`, `--rrt2-bubble-btn-bg-active`, `--rrt2-bubble-shadow`, `--rrt2-bubble-radius`.
- **Length caps** — `maxChars?: number`, `maxWords?: number`, `onMaxReached?: (kind) => void`. Implemented on `beforeinput` so deletes always pass; paste is also clipped. The hook now exposes `chars` and `words` directly.
- **Auto-link** — `autoLink?: boolean` (default `false`) wraps a typed URL in `<a href>` after a space or newline. `autoLinkPattern?: RegExp` overrides the default http(s) URL matcher.
- **Form-input parity** — `name`, `id`, `required`, `invalid`, `error`, `hint`, `label`. Renders a hidden `<input type="hidden" name={name} value={html}>` so the editor participates in `<form>` submissions. Sets `data-invalid="true"` + `aria-invalid` and uses the new `--rrt2-border-error` token when invalid. Label / hint / error render above and below the editor in line with the other input packages.

Non-breaking. Existing props, defaults, and CSS class names are unchanged.
