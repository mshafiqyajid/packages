# @mshafiqyajid/react-mention

Mention and hashtag autocomplete textarea for React. Detects trigger characters (@, #, custom) and shows a caret-positioned suggestion dropdown with full keyboard navigation and ARIA support.

**[Full docs →](https://docs.shafiqyajid.com/react/mention/)**

## Install

```bash
npm install @mshafiqyajid/react-mention
```

## Quick start

```tsx
import { MentionStyled } from "@mshafiqyajid/react-mention/styled";
import "@mshafiqyajid/react-mention/styles.css";

const users = [
  { id: "1", label: "Alice", description: "Product" },
  { id: "2", label: "Bob",   description: "Engineering" },
];

<MentionStyled
  label="Message"
  placeholder="Type @ to mention someone…"
  triggers={[{
    char: "@",
    loadSuggestions: (query) =>
      users.filter(u => u.label.toLowerCase().startsWith(query.toLowerCase())),
  }]}
/>
```

## Multiple triggers

```tsx
<MentionStyled
  triggers={[
    {
      char: "@",
      loadSuggestions: (q) => fetchUsers(q),
    },
    {
      char: "#",
      loadSuggestions: (q) => fetchTags(q),
      maxSuggestions: 6,
    },
  ]}
/>
```

## Async suggestions

```tsx
<MentionStyled
  triggers={[{
    char: "@",
    loadSuggestions: async (query) => {
      const res = await fetch(`/api/users?q=${query}`);
      return res.json();
    },
    minChars: 1,
  }]}
/>
```

## Headless

```tsx
import { useMention } from "@mshafiqyajid/react-mention";

const {
  textareaProps,
  dropdownProps,
  getItemProps,
  isOpen,
  suggestions,
  activeSuggestion,
  selectSuggestion,
  close,
} = useMention({
  triggers: [{
    char: "@",
    loadSuggestions: (q) => users.filter(u => u.label.includes(q)),
  }],
  onChange: (value) => console.log(value),
});
```

## License

MIT
