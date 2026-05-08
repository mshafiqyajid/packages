# @mshafiqyajid/react-code-block

Headless code block hook and styled syntax-highlighted code component for React. Optional [Shiki](https://shiki.style/) integration for rich syntax highlighting, with a plain-text fallback when Shiki is unavailable.

**[Full docs →](https://docs.shafiqyajid.com/react/code-block/)**

## Install

```bash
npm install @mshafiqyajid/react-code-block
# Optional — for syntax highlighting:
npm install shiki
```

## Styled component (quick start)

```tsx
import { CodeBlockStyled } from "@mshafiqyajid/react-code-block/styled";
import "@mshafiqyajid/react-code-block/styles.css";

export function Example() {
  return (
    <CodeBlockStyled
      code={`const greeting = "Hello, world!";
console.log(greeting);`}
      language="typescript"
      showLineNumbers
      showCopy
    />
  );
}
```

## Headless hook

```tsx
import { useCodeBlock } from "@mshafiqyajid/react-code-block";

function MyCodeBlock({ code, language = "text" }) {
  const { rootProps, copyProps, isCopied } = useCodeBlock({ code, language });

  return (
    <div {...rootProps}>
      <pre><code>{code}</code></pre>
      <button {...copyProps}>
        {isCopied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `code` | `string` | — | The code string to display |
| `language` | `string` | `"text"` | Language passed to Shiki |
| `theme` | `"auto" \| string` | `"auto"` | Shiki theme; "auto" follows `[data-theme]` |
| `showLineNumbers` | `boolean` | `false` | Prepend line numbers |
| `highlightLines` | `number[]` | — | 1-based line numbers to highlight |
| `diff` | `boolean` | `false` | Parse `+`/`-` prefix as add/remove |
| `showCopy` | `boolean` | `true` | Show the copy button |
| `copyLabel` | `string` | `"Copy"` | Copy button label |
| `copiedLabel` | `string` | `"Copied!"` | Label after successful copy |
| `onCopy` | `() => void` | — | Called on successful copy |
| `title` | `string` | — | Filename or label in header bar |
| `showLanguageLabel` | `boolean` | `true` | Show language in header |
| `maxHeight` | `string \| number` | — | Max height of the code area |
| `wrap` | `boolean` | `false` | Wrap long lines |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Font/padding size |
| `radius` | `"none" \| "sm" \| "md" \| "lg"` | `"md"` | Border radius |
| `className` | `string` | — | Extra class on root element |
| `style` | `CSSProperties` | — | Inline style on root element |
| `ref` | `Ref<HTMLDivElement>` | — | Forwarded to root element |

## CSS variables

```css
:root {
  --rcblk-bg: #f6f8fa;
  --rcblk-fg: #24292e;
  --rcblk-header-bg: #eaeef2;
  --rcblk-border: #d0d7de;
  --rcblk-line-number-fg: #8b949e;
  --rcblk-line-highlight-bg: rgba(255, 213, 0, 0.12);
  --rcblk-diff-add-bg: rgba(22, 163, 74, 0.12);
  --rcblk-diff-remove-bg: rgba(220, 38, 38, 0.12);
  --rcblk-copy-bg: transparent;
  --rcblk-copy-fg: #57606a;
  --rcblk-copy-bg-hover: rgba(0, 0, 0, 0.06);
  --rcblk-radius: 8px;
  --rcblk-font-size-sm: 0.75rem;
  --rcblk-font-size-md: 0.8125rem;
  --rcblk-font-size-lg: 0.9rem;
}
```
