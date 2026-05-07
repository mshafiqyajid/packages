# @mshafiqyajid/react-progress

## 0.4.0

### Minor Changes

- 26a5f07: Add `sections` segmented bar, `bufferValue` ghost track, and `ProgressCircleStack` concentric rings component.

  - `sections?: Array<{ value; tone?; label? }>` on `ProgressBar` — divides the bar into proportional coloured segments that animate in sequentially on mount (stagger left-to-right). Non-breaking: absent = existing single-fill behaviour.
  - `bufferValue?: number` on `ProgressBar` — renders a translucent ghost fill behind the active fill (video-player buffered-range pattern). Transitions at a slower speed than the active fill. Non-breaking.
  - `ProgressCircleStack` — new exported component rendering 2–4 concentric `ProgressCircle` rings (Apple Watch activity rings). Props: `rings`, `size` (default 120), `gap` (default 6px). Rings animate in with increasing delay per ring. All new motion respects `prefers-reduced-motion`.

## 0.3.0

### Minor Changes

- 660ad46: Add animated number counting to ProgressBar, and `formatValue` + `label` props to ProgressCircle.

  - `ProgressBar`: new `animateValue` prop (default `true`) — the displayed percentage counts up/down smoothly via `requestAnimationFrame` with a cubic ease-out when `value` changes. Automatically disabled under `prefers-reduced-motion`. Set `animateValue={false}` to opt out.
  - `ProgressCircle`: new `formatValue` prop — `(percent, value) => ReactNode` to customize the text rendered inside the ring, mirroring the existing `ProgressBar` prop.
  - `ProgressCircle`: new `label` prop — when set, the SVG is wrapped in a flex column container (`rprog-circle-wrap`) with a caption (`rprog-circle-label`) below the ring. The string value is also forwarded as `aria-label` on the SVG.

## 0.2.1

### Patch Changes

- fc93c26: docs: sync README with current API surface (no code changes).

  The README is bundled into the npm tarball at publish time, so updates to README.md only reach npm with a republish. This patch-bump republishes 14 packages whose READMEs had drifted behind props/features that already shipped — so the npm package pages now match the current API.

  What's covered per package:

  - **number-input**: `bigStep`, `wheelEnabled`, hold-to-repeat, keyboard table.
  - **tag-input**: `pasteDelimiters`, `transform`, `backspaceEditsLastTag`; corrected `tagVariant` values (`subtle`, not `soft`).
  - **phone-input**: `preferredCountries`, `searchable`, `searchPlaceholder`, `disableCountrySelector`.
  - **color**: `presets`, `disabled`.
  - **color-input**: `presets`, `recentColors`, `onRecentColorsChange`, `recentColorsLimit`, `eyeDropper`, `format="hsl"`.
  - **progress**: `segments`, `formatValue`.
  - **avatar**: `autoColor`, `showLoading`.
  - **badge**: `maxCount`, `pulse`, `uppercase`, `hideOnZero`, `showZero`.
  - **copy-button**: `errorLabel`.
  - **rich-text**: `sanitizePaste`, `allowedTags`, `transformPaste`.
  - **file-upload**: full Props table (`variant`, `multiple`, `accept`, `maxSize`, `maxFiles`, `uploader`, `concurrency`, `autoUpload`, callbacks, `renderPreview`).
  - **switch**: full Props table including async-pending semantics.
  - **slider**: full Props table (`range`, `marks`, `transform`, etc.).
  - **toast**: Toast options table (`type`, `title`, `duration`, `action`, `id`).

## 0.2.0

### Minor Changes

- 321da95: Progress polish (non-breaking):

  - `segments?: number` — render the bar as N discrete cells (e.g. 5 of 10 filled) instead of a continuous fill. `data-segmented="true"` lands on the root.
  - `formatValue(percent, value)` — customize the value display.
  - New CSS class `.rprog-bar-segment` and a `rprog-segment-pop` keyframe.

## 0.1.0

### Minor Changes

- 9bb89cb: Initial public release of react-switch, react-badge, react-avatar, react-progress, react-slider, react-popover, react-dropdown-menu, and react-timeline
