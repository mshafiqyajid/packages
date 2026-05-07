# @mshafiqyajid/react-rich-text

## 0.3.0

### Minor Changes

- 1ac1dc7: Six additive feature areas for `react-rich-text`:

  - **Keyboard shortcuts** — `shortcuts?: boolean | ShortcutMap` (default `true`). Built-ins: `Mod+B` bold, `Mod+I` italic, `Mod+U` underline, `Mod+K` link. `Mod` resolves to Cmd on Mac, Ctrl elsewhere. Pass `false` to disable, or a partial map to override individual actions. Browser default is suppressed so formatting doesn't double-fire.
  - **Inline link popover** — `defaultLinkPrompt?: "popover" | "prompt"` (default `"popover"`) replaces the old `window.prompt` flow. The built-in popover supports a URL field, an "Open in new tab" toggle, and Edit / Remove actions when re-opened on an existing link. `renderLinkPrompt?: (args) => ReactNode` allows full custom UI. New CSS classes `.rrt2-link-popover`, `.rrt2-link-popover-input`, `.rrt2-link-popover-actions` and tokens `--rrt2-popover-bg`, `--rrt2-popover-fg`, `--rrt2-popover-border`, `--rrt2-popover-shadow`, `--rrt2-popover-radius`.
  - **Floating bubble menu** — `bubbleMenu?: boolean | { items?: ToolbarItem[]; offset?: number }` shows a small toolbar above non-empty selections (auto-flips below if no room). Portaled to `document.body`. New CSS classes `.rrt2-bubble`, `.rrt2-bubble-btn` and tokens `--rrt2-bubble-bg`, `--rrt2-bubble-fg`, `--rrt2-bubble-btn-bg-hover`, `--rrt2-bubble-btn-bg-active`, `--rrt2-bubble-shadow`, `--rrt2-bubble-radius`.
  - **Length caps** — `maxChars?: number`, `maxWords?: number`, `onMaxReached?: (kind) => void`. Implemented on `beforeinput` so deletes always pass; paste is also clipped. The hook now exposes `chars` and `words` directly.
  - **Auto-link** — `autoLink?: boolean` (default `false`) wraps a typed URL in `<a href>` after a space or newline. `autoLinkPattern?: RegExp` overrides the default http(s) URL matcher.
  - **Form-input parity** — `name`, `id`, `required`, `invalid`, `error`, `hint`, `label`. Renders a hidden `<input type="hidden" name={name} value={html}>` so the editor participates in `<form>` submissions. Sets `data-invalid="true"` + `aria-invalid` and uses the new `--rrt2-border-error` token when invalid. Label / hint / error render above and below the editor in line with the other input packages.

  Non-breaking. Existing props, defaults, and CSS class names are unchanged.

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
