---
"@mshafiqyajid/react-tabs": minor
---

Navigation polish (non-breaking):

- `activation="automatic" | "manual"` — automatic (default) activates on focus; manual moves focus only and waits for Enter/Space.
- `orientation="horizontal" | "vertical"` — flips arrow keys (Up/Down vs. Left/Right) and rotates the indicator. Tablist gains `aria-orientation`.
- `lazyMount` — only mount panels after they've been activated at least once.
- `forceMount` — always render every panel regardless of `lazyMount`.
- `renderTab(ctx)` and `renderPanel(ctx)` slot props for full content control. The button shell + a11y stay owned by the component.
- `tone="success" | "danger"` extends the existing palette.
- `onChange` gains a second arg: `reason: "click" | "keyboard" | "programmatic"`.
- Tab triggers and panels now expose `data-state="active" | "inactive"`.
- New exported types: `TabsActivation`, `TabsOrientation`, `TabsChangeReason`, `TabsRenderTabContext`, `TabsRenderPanelContext`.
