// Color math utilities
export {
  clamp,
  round,
  hsvToRgb,
  rgbToHsv,
  hslToHsv,
  hsvToHsl,
  parseHex,
  rgbaToHex,
  rgbToHex,
  toHsva,
  hsvaToHex,
  hsvaToRgba,
  hsvaToHsla,
} from "./color";
export type {
  RgbColor,
  RgbaColor,
  HslColor,
  HslaColor,
  HsvColor,
  HsvaColor,
  AnyColor,
} from "./color";

// Headless hook
export { useColorPicker } from "./useColorPicker";
export type {
  UseColorPickerOptions,
  UseColorPickerResult,
} from "./useColorPicker";

// Primitives
export { SaturationField, HueSlider, AlphaSlider, HexInput } from "./primitives";
export type {
  SaturationFieldProps,
  HueSliderProps,
  AlphaSliderProps,
  HexInputProps,
} from "./primitives";
