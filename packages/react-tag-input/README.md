# @mshafiqyajid/react-tag-input

Tag/chip input with autocomplete for React. Headless hook + styled component. Keyboard navigation, validation, duplicate prevention, fully typed.

## Install

```bash
npm install @mshafiqyajid/react-tag-input
```

## Headless usage

```tsx
import { useTagInput } from "@mshafiqyajid/react-tag-input";

function MyTagInput() {
  const { tags, inputProps, removeTag, filteredSuggestions, activeIndex } = useTagInput({
    suggestions: ["React", "Vue", "Svelte", "Angular"],
    maxTags: 5,
  });

  return (
    <div>
      {tags.map((tag, i) => (
        <span key={i}>
          {tag} <button onClick={() => removeTag(i)}>×</button>
        </span>
      ))}
      <input {...inputProps} placeholder="Add a tag..." />
      {filteredSuggestions.length > 0 && (
        <ul>
          {filteredSuggestions.map((s, i) => (
            <li key={s} aria-selected={i === activeIndex}>{s}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Styled usage

```tsx
import { TagInputStyled } from "@mshafiqyajid/react-tag-input/styled";
import "@mshafiqyajid/react-tag-input/styles.css";

function App() {
  const [tags, setTags] = useState<string[]>([]);

  return (
    <TagInputStyled
      value={tags}
      onChange={setTags}
      suggestions={["React", "Vue", "Svelte", "Angular"]}
      label="Technologies"
      placeholder="Add a tag..."
      tone="primary"
      size="md"
    />
  );
}
```

## Paste handling

```tsx
<TagInputStyled
  value={tags}
  onChange={setTags}
  // Default delimiters split pasted text by comma, semicolon, newline, tab.
  // Pass null to disable paste-splitting.
  pasteDelimiters={[",", ";", /\s*\n\s*/, /\s*\t\s*/]}
  // Normalize each tag before insertion.
  transform={(t) => t.toLowerCase().trim()}
/>
```

## Props (additions)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pasteDelimiters` | `(string \| RegExp)[] \| null` | `[",", ";", /\s*\n\s*/, /\s*\t\s*/]` | Split pasted text into multiple tags. `null` disables paste-splitting. |
| `transform` | `(tag) => string` | — | Normalize each tag before insertion (e.g. lowercase, trim). |
| `backspaceEditsLastTag` | `boolean` | `false` | When the input is empty, Backspace pops the last tag back into the input for editing instead of deleting it. |
| `tagVariant` | `"solid" \| "subtle" \| "outline"` | `"solid"` | Visual style for tag chips. |

## Docs

[https://docs.shafiqyajid.com/react/tag-input/](https://docs.shafiqyajid.com/react/tag-input/)

## License

MIT

## What's new in 1.2.0

- **Async `loadOptions: (query: string) => Promise<string[]>`** — debounced (default 300 ms), cancellable via `AbortController`, with `isLoading` + `loadError` exposed.
- **`colorize: (tag: string) => string`** — derive a CSS color per tag (category-based, hash-based) and apply as the chip background. `data-colorized` lands for further styling hooks.
- **`tagActions: (tag, index) => ReactNode`** — render extra buttons inside each chip (rename, link, copy).
- **`onReorder: (tags: string[]) => void`** — fires after a drag-reorder commits (alongside the existing `onChange`).
- **Spreadsheet TSV paste** — `spreadsheetPaste: true` (default) treats `\n` and `\t` as cell breaks alongside the existing comma/semicolon split.
