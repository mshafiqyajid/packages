# @mshafiqyajid/react-divider

Horizontal and vertical divider with optional label, tones, and line styles.

**[Full docs →](https://docs.shafiqyajid.com/react/divider/)**

## Install

```bash
npm install @mshafiqyajid/react-divider
```

## Quick start

```tsx
import { DividerStyled } from "@mshafiqyajid/react-divider/styled";
import "@mshafiqyajid/react-divider/styles.css";

// Simple horizontal line
<DividerStyled />

// With label
<DividerStyled label="Section title" />

// Toned dashed
<DividerStyled tone="primary" lineStyle="dashed" />

// Label aligned to start
<DividerStyled label="Or" labelAlign="start" />

// Vertical (place in a flex row)
<div style={{ display: "flex", height: 40 }}>
  <span>Left</span>
  <DividerStyled orientation="vertical" />
  <span>Right</span>
</div>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Divider direction |
| `label` | `ReactNode` | — | Optional label between the lines |
| `labelAlign` | `"start" \| "center" \| "end"` | `"center"` | Label position (horizontal only) |
| `tone` | `"neutral" \| "primary" \| "success" \| "warning" \| "danger" \| "info"` | `"neutral"` | Line color |
| `lineStyle` | `"solid" \| "dashed" \| "dotted"` | `"solid"` | Border style |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Line thickness (`lg` = 2px) |
| `spacing` | `"sm" \| "md" \| "lg"` | `"md"` | Margin around the divider |

## Headless usage

```tsx
import { useDivider } from "@mshafiqyajid/react-divider";

function MyDivider() {
  const { dividerProps } = useDivider({ orientation: "horizontal" });
  return <hr {...dividerProps} className="my-divider" />;
}
```

## License

MIT
