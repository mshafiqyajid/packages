---
"@mshafiqyajid/react-timeline": minor
---

feat(timeline): alternate zigzag layout, horizontal orientation, progress connector, animateOnMount

- `align="alternate"` — zigzag layout alternating content left/right of the connector line. New CSS classes `rtl-item--left` / `rtl-item--right`.
- `orientation="horizontal"` — left-to-right layout with `scroll-snap-type: x mandatory`. New CSS class `rtl-root--horizontal`.
- `progress?: number` (0–100) — fills the connector line proportionally with an animated `::after` element. CSS var `--rtl-progress-color`.
- `animateOnMount?: boolean` — each item fades + slides in via `IntersectionObserver` as it enters the viewport. Items stagger by index × 80ms. Graceful fallback when `IntersectionObserver` is unavailable.

All new animations respect `prefers-reduced-motion`.
