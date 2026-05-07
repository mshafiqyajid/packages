---
"@mshafiqyajid/react-progress": minor
---

Add animated number counting to ProgressBar, and `formatValue` + `label` props to ProgressCircle.

- `ProgressBar`: new `animateValue` prop (default `true`) — the displayed percentage counts up/down smoothly via `requestAnimationFrame` with a cubic ease-out when `value` changes. Automatically disabled under `prefers-reduced-motion`. Set `animateValue={false}` to opt out.
- `ProgressCircle`: new `formatValue` prop — `(percent, value) => ReactNode` to customize the text rendered inside the ring, mirroring the existing `ProgressBar` prop.
- `ProgressCircle`: new `label` prop — when set, the SVG is wrapped in a flex column container (`rprog-circle-wrap`) with a caption (`rprog-circle-label`) below the ring. The string value is also forwarded as `aria-label` on the SVG.
