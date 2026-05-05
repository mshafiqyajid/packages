# @mshafiqyajid/react-color

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

- 321da95: Color picker polish (non-breaking):

  - `presets: string[]` — render a row of click-to-apply swatches below the saturation field. Active swatch lands `data-active="true"`.
  - `disabled` prop locks the picker (`data-disabled="true"`, `pointer-events: none`).
  - Both apply to all three picker variants (`HexColorPicker`, `RgbaColorPicker`, `HslaColorPicker`).
  - New CSS hooks: `.rcp-presets`, `.rcp-preset`, `.rcp-picker[data-disabled]`.

## 0.1.2

### Patch Changes

- 0d8d416: Add react-tooltip package; update npm homepage to docs site for all packages

## 0.1.1

### Patch Changes

- 99a05f0: Fix dark mode theme sync; remove prefers-color-scheme auto-detection

## 0.1.0

### Minor Changes

- 29a8bf6: Initial public release.

  Modern drop-in replacement for `react-color` (1.9M weekly downloads, last published Jun 2022, 7 heavy deps, 37 KB).

  - `HexColorPicker`, `RgbaColorPicker`, `HslaColorPicker` styled pickers with saturation field, hue slider, optional alpha slider, and hex text input.
  - `useColorPicker()` headless hook exposing `saturationFieldProps`, `hueSliderProps`, `alphaSliderProps`, `sbPosition`, `huePosition`, `alphaPosition` for fully custom UIs.
  - `SaturationField`, `HueSlider`, `AlphaSlider`, `HexInput` headless primitives.
  - Complete color-math library: hex/RGB/HSL/HSV conversions, parsing, clamping — all pure functions, no external dependencies.
  - `setPointerCapture` for smooth drag. CSS variables for theming. Dark-mode aware. Respects `prefers-reduced-motion`.
  - ~11 KB ESM (vs 37 KB). Zero runtime dependencies. SSR-safe. React 17-19.
