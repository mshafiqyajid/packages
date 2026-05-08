# @mshafiqyajid/react-skeleton

Headless skeleton hook and styled loading placeholder for React.

**[Full docs →](https://docs.shafiqyajid.com/react/skeleton/)**

## Install

```bash
npm install @mshafiqyajid/react-skeleton
```

## Quick start

```tsx
import { SkeletonStyled } from "@mshafiqyajid/react-skeleton/styled";
import "@mshafiqyajid/react-skeleton/styles.css";

// Rectangle (default)
<SkeletonStyled width="100%" height={20} />

// Circle avatar
<SkeletonStyled variant="circle" width="2.5rem" height="2.5rem" />

// Text block
<SkeletonStyled variant="text" lines={3} />

// Wave animation
<SkeletonStyled variant="rect" animation="wave" width="100%" height={100} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | "rect" \| "line" \| "circle" \| "text" | "rect" | Shape variant |
| animation | "pulse" \| "wave" \| "none" | "pulse" | Animation style |
| width | string \| number | — | Width (e.g. "100%", 200) |
| height | string \| number | — | Height (e.g. 20, "1rem") |
| radius | "none" \| "sm" \| "md" \| "lg" \| "full" | "sm" | Border radius |
| lines | number | 3 | Number of lines (text variant only) |
| lastLineWidth | string | "60%" | Last line width (text variant only) |
| className | string | — | Extra class on root |
| style | CSSProperties | — | Inline style override |

## Headless usage

```tsx
import { useSkeleton } from "@mshafiqyajid/react-skeleton";

function MySkeleton() {
  const { skeletonProps } = useSkeleton();
  return <div {...skeletonProps} className="my-skeleton" />;
}
```
