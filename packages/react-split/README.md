# @mshafiqyajid/react-split

Resizable two-pane split panel for React.

**[Full docs →](https://docs.shafiqyajid.com/react/split/)**

## Install

```bash
npm install @mshafiqyajid/react-split
```

## Quick start

```tsx
import { SplitStyled } from "@mshafiqyajid/react-split/styled";
import "@mshafiqyajid/react-split/styles.css";

<SplitStyled>
  <div>Left pane</div>
  <div>Right pane</div>
</SplitStyled>
```

## Headless

```tsx
import { useSplit } from "@mshafiqyajid/react-split";

function MySplit() {
  const { containerProps, getPaneProps, getResizerProps, sizes, isDragging } = useSplit();
  return (
    <div {...containerProps}>
      <div {...getPaneProps(0)}>Left</div>
      <div {...getResizerProps()} />
      <div {...getPaneProps(1)}>Right</div>
    </div>
  );
}
```

## License

MIT
