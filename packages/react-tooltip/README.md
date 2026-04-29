# @mshafiqyajid/react-tooltip

Headless tooltip hook and styled component for React. Accessible, keyboard-friendly, smart flip positioning, animated, SSR-safe, fully typed.

**[Full docs →](https://docs.shafiqyajid.com/react/tooltip/)**

Zero dependencies. SSR-safe. Fully typed. ESM + CJS.

## Install

```bash
npm install @mshafiqyajid/react-tooltip
```

Peer dependency: `react >= 17`.

## Quick start

### Styled (recommended)

```tsx
import { TooltipStyled } from "@mshafiqyajid/react-tooltip/styled";
import "@mshafiqyajid/react-tooltip/styles.css";

<TooltipStyled content="Copy to clipboard">
  <button>Copy</button>
</TooltipStyled>
```

### Headless

```tsx
import { useTooltip } from "@mshafiqyajid/react-tooltip";

function MyTooltip({ content, children }) {
  const { triggerProps, tooltipProps, placement, isVisible } = useTooltip({ placement: "top" });

  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <div {...triggerProps}>{children}</div>
      <div
        {...tooltipProps}
        data-placement={placement}
        style={{ opacity: isVisible ? 1 : 0 }}
      >
        {content}
      </div>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `content` | `ReactNode` | — | Tooltip text or content |
| `placement` | `"top" \| "bottom" \| "left" \| "right"` | `"top"` | Preferred placement (auto-flips near edges) |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size of the tooltip |
| `tone` | `"neutral" \| "primary" \| "success" \| "danger"` | `"neutral"` | Color tone |
| `delay` | `number` | `0` | Show delay in ms |
| `multiline` | `boolean` | `false` | Allow content to wrap (for rich HTML content) |
| `disabled` | `boolean` | `false` | Disable the tooltip |

## License

MIT
