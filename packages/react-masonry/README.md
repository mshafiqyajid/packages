# @mshafiqyajid/react-masonry

Headless masonry hook and CSS-columns masonry layout for React. No JS measurement.

**[Full docs →](https://docs.shafiqyajid.com/react/masonry/)**

## Install

```bash
npm install @mshafiqyajid/react-masonry
```

## Quick start

```tsx
import { MasonryStyled } from "@mshafiqyajid/react-masonry/styled";
import "@mshafiqyajid/react-masonry/styles.css";

<MasonryStyled columns={3} spacing={16}>
  <div>Card 1</div>
  <div>Card 2</div>
  <div>Card 3</div>
</MasonryStyled>
```

## Responsive columns

```tsx
<MasonryStyled columns={{ default: 1, 768: 2, 1024: 3 }} spacing={24}>
  {items.map((item) => (
    <div key={item.id}>{item.content}</div>
  ))}
</MasonryStyled>
```

## Headless hook

```tsx
import { useMasonry } from "@mshafiqyajid/react-masonry";

function MyMasonry({ children }) {
  const { containerProps, getItemProps } = useMasonry({ columns: 3 });

  return (
    <div {...containerProps} className="my-masonry">
      {React.Children.map(children, (child) => (
        <div {...getItemProps()}>{child}</div>
      ))}
    </div>
  );
}
```

## API

| Prop | Type | Default | Description |
|---|---|---|---|
| columns | number \| BreakpointMap | 3 | Column count or responsive map e.g. `{ default: 1, 768: 2 }` |
| spacing | number \| string | 16 | Gap between items in px or any CSS value |
| as | ElementType | "div" | Polymorphic container element |
| className | string | — | Extra class on the root element |
| style | CSSProperties | — | Inline style override |

## How it works

Uses CSS `column-count` with `break-inside: avoid` on items. No `position: absolute`, no `ResizeObserver` for layout — items flow naturally top-to-bottom in each column. Fast, SSR-compatible, and zero runtime layout dependencies.
