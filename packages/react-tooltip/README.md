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
| `placement` | `top \| bottom \| left \| right` plus each with `-start` / `-end` | `"top"` | Preferred side and alignment |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size of the tooltip |
| `tone` | `"neutral" \| "primary" \| "success" \| "danger"` | `"neutral"` | Color tone |
| `delay` | `number` | `0` | Show delay in ms |
| `multiline` | `boolean` | `false` | Allow content to wrap (for rich HTML content) |
| `disabled` | `boolean` | `false` | Disable the tooltip |
| `offset` | `number` | `8` | Gap in px between trigger and tooltip |
| `collisionPadding` | `number` | `8` | Viewport edge margin for flip / shift |
| `flip` | `boolean` | `true` | Auto-flip to opposite side near edges |
| `shift` | `boolean` | `true` | Push back into view along the cross-axis |
| `strategy` | `"absolute" \| "fixed"` | `"absolute"` | Positioning strategy |
| `interactive` | `boolean` | `false` | Stay open when cursor moves onto tooltip body (50ms bridge delay) |
| `followCursor` | `boolean` | `false` | Tooltip tracks pointer position instead of anchoring to trigger |
| `sticky` | `boolean` | `false` | Keep open while cursor is over the tooltip body |
| `header` | `ReactNode` | — | Optional header above content |
| `footer` | `ReactNode` | — | Optional footer below content |
| `longPressDelay` | `number` | `500` | Touch long-press delay in ms; `0` disables touch trigger |
| `group` | `string` | — | Group key for keyboard nav between tooltips |
| `groupId` | `string` | — | Order id within the group (falls back to DOM order) |

`data-placement` on the tooltip reflects the resolved (post-flip) placement.

### TooltipProvider props

| Prop | Type | Default | Description |
|---|---|---|---|
| `delayIn` | `number` | `700` | Show delay for the first tooltip in the group |
| `skipDelay` | `number` | `50` | Show delay for subsequent tooltips while group is active (sweep) |
| `delayOut` | `number` | `200` | How long after all tooltips close before the group resets |

## License

MIT

## What's new in 0.4.0

- **`<TooltipProvider delayIn={700} skipDelay={50} delayOut={200}>`** — wrap multiple tooltips in a delay group. First tooltip opens after `delayIn`; while any in the group is open, subsequent ones open after `skipDelay` (sweep behaviour). After all close, the timer resets after `delayOut` ms. CSS class `rtt-provider`.
- **`interactive?: boolean`** — keeps the tooltip open when the cursor moves from the trigger onto the tooltip body. A 50ms bridge prevents accidental dismissal when crossing the gap. The tooltip gets `pointer-events: auto` and `data-interactive`.
- **`followCursor?: boolean`** — tooltip tracks the pointer instead of anchoring to the trigger. Flip/shift are disabled. Useful for data-viz hover labels. The arrow is hidden and `data-follow-cursor` is set.
- **`<TooltipObserver />`** — mount once; auto-wraps any element with `data-tooltip="…"` in a `<TooltipStyled>` using a `MutationObserver`.
- **Spring entrance animation** — tooltip scales from 0.85 → 1 with `cubic-bezier(0.34, 1.56, 0.64, 1)` over 180ms; exit fades and scales back over 120ms. Transform origin tracks the placement side. Respects `prefers-reduced-motion`.

## What's new in 0.3.0

- **`sticky: true`** — keeps the tooltip open when the cursor moves from the trigger onto the tooltip body (interactive content).
- **`--rtt-arrow-bg` CSS var** — themed tooltips now keep arrow colour in sync.
- **`group?: string` + `groupId?: string`** — sequential keyboard nav; ↓/↑ on a focused trigger cycles through every tooltip sharing the group.
- **`header?` / `footer?` slots** — render rich content above/below the main tooltip body without composing a popover.
- **`longPressDelay?: number`** (default `500`) — touch long-press to show; set `0` to disable touch trigger entirely.
