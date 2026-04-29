/**
 * Pure color-math utilities. No side effects, no DOM, no React.
 * All functions accept/return plain data so they're easy to test.
 */

// ============================================================================
// Types
// ============================================================================

export interface RgbColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface RgbaColor extends RgbColor {
  a: number; // 0-1
}

export interface HslColor {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export interface HslaColor extends HslColor {
  a: number; // 0-1
}

export interface HsvColor {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
}

export interface HsvaColor extends HsvColor {
  a: number; // 0-1
}

export type AnyColor =
  | string
  | RgbColor
  | RgbaColor
  | HslColor
  | HslaColor
  | HsvColor
  | HsvaColor;

// ============================================================================
// Clamping helpers
// ============================================================================

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function round(n: number, precision = 0): number {
  const factor = 10 ** precision;
  return Math.round(n * factor) / factor;
}

// ============================================================================
// HSV <-> RGB
// ============================================================================

export function hsvToRgb({ h, s, v }: HsvColor): RgbColor {
  const S = s / 100;
  const V = v / 100;
  const H = ((h % 360) + 360) % 360;

  const C = S * V;
  const X = C * (1 - Math.abs(((H / 60) % 2) - 1));
  const m = V - C;

  let r = 0;
  let g = 0;
  let b = 0;

  if (H < 60) { r = C; g = X; b = 0; }
  else if (H < 120) { r = X; g = C; b = 0; }
  else if (H < 180) { r = 0; g = C; b = X; }
  else if (H < 240) { r = 0; g = X; b = C; }
  else if (H < 300) { r = X; g = 0; b = C; }
  else { r = C; g = 0; b = X; }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

export function rgbToHsv({ r, g, b }: RgbColor): HsvColor {
  const R = r / 255;
  const G = g / 255;
  const B = b / 255;

  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (d !== 0) {
    if (max === R) h = ((G - B) / d + (G < B ? 6 : 0)) / 6;
    else if (max === G) h = ((B - R) / d + 2) / 6;
    else h = ((R - G) / d + 4) / 6;
  }

  return {
    h: round(h * 360),
    s: round(s * 100),
    v: round(v * 100),
  };
}

// ============================================================================
// HSL <-> HSV (via RGB)
// ============================================================================

export function hslToHsv({ h, s, l }: HslColor): HsvColor {
  const S = s / 100;
  const L = l / 100;

  const v = L + S * Math.min(L, 1 - L);
  const sv = v === 0 ? 0 : 2 * (1 - L / v);

  return {
    h,
    s: round(sv * 100),
    v: round(v * 100),
  };
}

export function hsvToHsl({ h, s, v }: HsvColor): HslColor {
  const S = s / 100;
  const V = v / 100;

  const l = V * (1 - S / 2);
  const sl = l === 0 || l === 1 ? 0 : (V - l) / Math.min(l, 1 - l);

  return {
    h,
    s: round(sl * 100),
    l: round(l * 100),
  };
}

// ============================================================================
// Hex parsing / formatting
// ============================================================================

const HEX_RE = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

export function parseHex(hex: string): RgbaColor | null {
  const m = HEX_RE.exec(hex.trim());
  if (!m) return null;

  let h = m[1]!;
  // Expand short form: #abc → #aabbcc, #abcd → #aabbccdd
  if (h.length === 3 || h.length === 4) {
    h = h.split("").map((c) => c + c).join("");
  }

  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const a = h.length === 8 ? round(parseInt(h.slice(6, 8), 16) / 255, 2) : 1;

  return { r, g, b, a };
}

export function rgbaToHex({ r, g, b, a }: RgbaColor, includeAlpha = false): string {
  const hex =
    [r, g, b].map((n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0")).join("") +
    (includeAlpha && a < 1 ? Math.round(a * 255).toString(16).padStart(2, "0") : "");
  return `#${hex}`;
}

export function rgbToHex(rgb: RgbColor): string {
  return rgbaToHex({ ...rgb, a: 1 }, false);
}

// ============================================================================
// Parsing any supported input to HSVA
// ============================================================================

function isRgbLike(v: object): v is RgbColor {
  return "r" in v && "g" in v && "b" in v;
}

function isHsvLike(v: object): v is HsvColor {
  return "h" in v && "s" in v && "v" in v;
}

function isHslLike(v: object): v is HslColor {
  return "h" in v && "s" in v && "l" in v;
}

export function toHsva(color: AnyColor): HsvaColor {
  if (typeof color === "string") {
    const rgba = parseHex(color);
    if (!rgba) return { h: 0, s: 0, v: 0, a: 1 };
    return { ...rgbToHsv(rgba), a: rgba.a };
  }
  if (isHsvLike(color)) {
    return { a: 1, ...color } as HsvaColor;
  }
  if (isHslLike(color)) {
    const hsv = hslToHsv(color as HslColor);
    return { ...hsv, a: ("a" in color ? (color as HslaColor).a : 1) };
  }
  if (isRgbLike(color)) {
    const hsv = rgbToHsv(color as RgbColor);
    return { ...hsv, a: ("a" in color ? (color as RgbaColor).a : 1) };
  }
  return { h: 0, s: 0, v: 0, a: 1 };
}

export function hsvaToHex(hsva: HsvaColor): string {
  return rgbaToHex({ ...hsvToRgb(hsva), a: hsva.a }, hsva.a < 1);
}

export function hsvaToRgba(hsva: HsvaColor): RgbaColor {
  return { ...hsvToRgb(hsva), a: hsva.a };
}

export function hsvaToHsla(hsva: HsvaColor): HslaColor {
  return { ...hsvToHsl(hsva), a: hsva.a };
}
