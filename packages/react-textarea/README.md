# @mshafiqyajid/react-textarea

Auto-resizing textarea with character count and form-control integration.

**[Full docs →](https://docs.shafiqyajid.com/react/textarea/)**

## Install

```bash
npm install @mshafiqyajid/react-textarea
```

## Quick start

```tsx
import { TextareaStyled } from "@mshafiqyajid/react-textarea/styled";
import "@mshafiqyajid/react-textarea/styles.css";

<TextareaStyled
  label="Message"
  placeholder="Type something..."
  maxLength={500}
  showCount
  autoResize
/>
```

## Headless

```tsx
import { useTextarea } from "@mshafiqyajid/react-textarea";

const { textareaProps, charCount, isAtLimit } = useTextarea({
  maxLength: 200,
});

return (
  <div>
    <textarea {...textareaProps} />
    <span>{charCount} / 200</span>
  </div>
);
```

## License

MIT
