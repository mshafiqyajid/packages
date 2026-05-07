# @mshafiqyajid/react-rich-text

Headless rich text hook and styled component for React. Zero dependencies, contentEditable-based, fully typed.

**[Full docs →](https://docs.shafiqyajid.com/react/rich-text/)**

Zero dependencies. Fully typed. ESM + CJS.

## What's new in 0.3.0

- **Keyboard shortcuts** — `Mod+B`, `Mod+I`, `Mod+U`, `Mod+K` (link) by default. Pass `shortcuts={false}` to disable, or a partial map to override individual actions.
- **Inline link popover** — replaces `window.prompt` with a real popover that includes an "Open in new tab" toggle and Edit / Remove when re-opened on an existing link. Set `defaultLinkPrompt="prompt"` to keep the legacy behaviour, or pass `renderLinkPrompt` for full custom UI.
- **Floating bubble menu** — opt in via `bubbleMenu` to show a small toolbar over a non-empty selection. Customise items and offset via `bubbleMenu={{ items: [...], offset: 8 }}`.
- **Length caps** — `maxChars` and `maxWords` block inserts past the cap and fire `onMaxReached("chars" | "words")`. Deletes always pass. The hook also exposes `chars` and `words` counts directly.
- **Auto-link** — opt in via `autoLink` to wrap typed URLs in `<a>` after a space or newline. Override the pattern with `autoLinkPattern`.
- **Form-input parity** — `name`, `id`, `required`, `invalid`, `error`, `hint`, `label`. Renders a hidden `<input>` so the editor participates in `<form>` submissions; sets `data-invalid` + `aria-invalid` and uses the new `--rrt2-border-error` token when invalid.

All additive — existing props, defaults, and CSS class names are unchanged.

## Install

```bash
npm install @mshafiqyajid/react-rich-text
```

Peer dependency: `react >= 17`.

## Quick start

### Styled (recommended)

```tsx
import { RichTextStyled } from "@mshafiqyajid/react-rich-text/styled";
import "@mshafiqyajid/react-rich-text/styles.css";

<RichTextStyled
  defaultValue="<p>Hello world</p>"
  onChange={(html) => console.log(html)}
  placeholder="Start typing..."
  bubbleMenu
  autoLink
  label="Bio"
  hint="Markdown supported"
  name="bio"
/>
```

### Headless

```tsx
import { useRichText } from "@mshafiqyajid/react-rich-text";

function MyEditor() {
  const { editorProps, execCommand, isBold, isItalic, words, chars } = useRichText({
    defaultValue: "<p>Hello</p>",
    onChange: (html) => console.log(html),
    maxWords: 100,
    onMaxReached: (kind) => console.warn("hit cap:", kind),
  });

  return (
    <div>
      <button
        onMouseDown={(e) => { e.preventDefault(); execCommand("bold"); }}
        aria-pressed={isBold}
      >
        Bold
      </button>
      <div {...editorProps} />
      <small>{words} words · {chars} chars</small>
    </div>
  );
}
```

## API

### `useRichText(options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `value` | `string` | — | Controlled HTML value |
| `defaultValue` | `string` | `""` | Uncontrolled initial HTML |
| `onChange` | `(html: string) => void` | — | Called on every content change |
| `disabled` | `boolean` | `false` | Disables editing |
| `readOnly` | `boolean` | `false` | Makes content read-only |
| `sanitizePaste` | `boolean` | `true` | Strip `style`, `class`, `on*` attrs and disallowed tags from pasted HTML. Blocks `javascript:` and `data:` URLs. Plain-text paste preserves newlines as `<br>`. |
| `allowedTags` | `string[]` | (safe set) | Tag whitelist used by both the on-change pass and paste sanitization. Defaults cover standard formatting tags. |
| `transformPaste` | `(html) => string` | — | Run after `sanitizePaste`. Use for custom paste transforms. |
| `maxChars` | `number` | — | Hard cap on plain-text characters (deletes always pass). |
| `maxWords` | `number` | — | Hard cap on whitespace-separated words. |
| `onMaxReached` | `(kind: "chars" \| "words") => void` | — | Fires when an insert is blocked by a cap. |
| `autoLink` | `boolean` | `false` | Wrap typed URLs in `<a>` after a space or newline. |
| `autoLinkPattern` | `RegExp` | http(s) URL | Pattern used by `autoLink`. |
| `shortcuts` | `ShortcutMap \| false` | — | Headless shortcut spec (the styled component sets defaults). |
| `onShortcut` | `(action, event) => void` | — | Fires when a shortcut matches; useful for custom actions. |

Returns: `editorProps`, `execCommand(command, value?)`, `queryCommandState(command)`, `isBold`, `isItalic`, `isUnderline`, `isStrikethrough`, `html`, `chars`, `words`.

### `RichTextStyled`

All `useRichText` options plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Editor size preset |
| `tone` | `"neutral" \| "primary"` | `"neutral"` | Color tone |
| `placeholder` | `string` | — | Placeholder text |
| `minHeight` | `string` | `"120px"` | Min height of editor area |
| `maxHeight` | `string` | — | Max height (enables scroll) |
| `showToolbar` | `boolean` | `true` | Show/hide the toolbar |
| `toolbarItems` | `ToolbarItem[]` | all items | Which toolbar buttons to show |
| `wordCount` | `boolean` | `false` | Show word/character count footer |
| `spellCheck` | `boolean` | `true` | Enable spell check |
| `shortcuts` | `boolean \| ShortcutMap` | `true` | Built-in shortcuts (`Mod+B/I/U/K`). `false` to disable; partial map to override. |
| `defaultLinkPrompt` | `"popover" \| "prompt"` | `"popover"` | Inline popover (with new-tab toggle and Edit / Remove on existing links) or legacy `window.prompt`. |
| `renderLinkPrompt` | `(args) => ReactNode` | — | Render-prop override for the link prompt UI. |
| `bubbleMenu` | `boolean \| { items?: ToolbarItem[]; offset?: number }` | `false` | Floating toolbar over non-empty selections. |
| `name` | `string` | — | Hidden `<input name>` so the editor submits in a `<form>`. |
| `id` | `string` | auto | id for the editor; wires up the label. |
| `required` | `boolean` | `false` | Adds an asterisk to the label and `aria-required`. |
| `invalid` | `boolean` | `false` | Sets `data-invalid` + `aria-invalid`; uses `--rrt2-border-error`. |
| `error` | `ReactNode` | — | Error message below the editor. Implies `invalid`. |
| `hint` | `ReactNode` | — | Hint message below the editor when no error. |
| `label` | `ReactNode` | — | Label rendered above the editor. |

## License

MIT
