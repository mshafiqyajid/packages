# @mshafiqyajid/react-rich-text

Headless rich text hook and styled component for React. Zero dependencies, contentEditable-based, fully typed.

**[Full docs →](https://docs.shafiqyajid.com/react/rich-text/)**

Zero dependencies. Fully typed. ESM + CJS.

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
/>
```

### Headless

```tsx
import { useRichText } from "@mshafiqyajid/react-rich-text";

function MyEditor() {
  const { editorProps, execCommand, isBold, isItalic } = useRichText({
    defaultValue: "<p>Hello</p>",
    onChange: (html) => console.log(html),
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

Returns: `editorProps`, `execCommand(command, value?)`, `queryCommandState(command)`, `isBold`, `isItalic`, `isUnderline`, `isStrikethrough`, `html`.

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

## License

MIT
