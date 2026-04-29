# @mshafiqyajid/react-color

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
