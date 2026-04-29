/**
 * Low-level building blocks. No styles — consumers bring their own CSS or
 * use the styled exports. Each accepts the hook result and spreads props.
 */
import {
  type HTMLAttributes,
  type InputHTMLAttributes,
  forwardRef,
  useCallback,
  useRef,
} from "react";
import { type HsvaColor, hsvaToHex, parseHex } from "./color";
import { type UseColorPickerResult } from "./useColorPicker";

// ============================================================================
// SaturationField — 2D saturation + brightness picker square
// ============================================================================

export interface SaturationFieldProps extends HTMLAttributes<HTMLDivElement> {
  picker: UseColorPickerResult;
}

export const SaturationField = forwardRef<HTMLDivElement, SaturationFieldProps>(
  function SaturationField({ picker, children, ...rest }, _ref) {
    return (
      <div
        {...picker.saturationFieldProps}
        ref={picker.saturationFieldProps.ref as React.Ref<HTMLDivElement>}
        {...rest}
      >
        {children}
        <div
          className="rcp-sb-pointer"
          style={{
            left: `${picker.sbPosition.left}%`,
            top: `${picker.sbPosition.top}%`,
          }}
        />
      </div>
    );
  },
);

// ============================================================================
// HueSlider — horizontal hue strip
// ============================================================================

export interface HueSliderProps extends HTMLAttributes<HTMLDivElement> {
  picker: UseColorPickerResult;
}

export const HueSlider = forwardRef<HTMLDivElement, HueSliderProps>(
  function HueSlider({ picker, children, ...rest }, _ref) {
    return (
      <div
        {...picker.hueSliderProps}
        ref={picker.hueSliderProps.ref as React.Ref<HTMLDivElement>}
        {...rest}
      >
        {children}
        <div
          className="rcp-slider-pointer"
          style={{ left: `${picker.huePosition}%` }}
        />
      </div>
    );
  },
);

// ============================================================================
// AlphaSlider — horizontal alpha strip
// ============================================================================

export interface AlphaSliderProps extends HTMLAttributes<HTMLDivElement> {
  picker: UseColorPickerResult;
  /** HSVA color used to compute the gradient background. */
  hsva: HsvaColor;
}

export const AlphaSlider = forwardRef<HTMLDivElement, AlphaSliderProps>(
  function AlphaSlider({ picker, hsva, children, style, ...rest }, _ref) {
    const hex = hsvaToHex({ ...hsva, a: 1 });
    return (
      <div
        {...picker.alphaSliderProps}
        ref={picker.alphaSliderProps.ref as React.Ref<HTMLDivElement>}
        style={{
          ...style,
          background: `linear-gradient(to right, transparent, ${hex})`,
        }}
        {...rest}
      >
        {children}
        <div
          className="rcp-slider-pointer"
          style={{ left: `${picker.alphaPosition}%` }}
        />
      </div>
    );
  },
);

// ============================================================================
// HexInput — controlled hex color text input
// ============================================================================

export interface HexInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  /** Current color as HSVA. */
  hsva: HsvaColor;
  /** Called when a valid hex is entered. */
  onChange: (hsva: HsvaColor) => void;
  /** Include alpha channel in the hex output (#rrggbbaa). Default: false. */
  alpha?: boolean;
}

export const HexInput = forwardRef<HTMLInputElement, HexInputProps>(
  function HexInput({ hsva, onChange, alpha = false, ...rest }, ref) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const mergedRef = (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
    };

    const displayValue = hsvaToHex(hsva).replace("#", "").toUpperCase();

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9a-f]/gi, "");
        if (raw.length === 6 || raw.length === 8) {
          const parsed = parseHex(`#${raw}`);
          if (parsed) {
            onChange({ ...hsva, ...parsed });
          }
        }
      },
      [hsva, onChange],
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        // Restore canonical value on invalid input
        const raw = e.target.value.replace(/[^0-9a-f]/gi, "");
        if (raw.length !== 6 && raw.length !== 8) {
          e.target.value = displayValue;
        }
        rest.onBlur?.(e);
      },
      [displayValue, rest],
    );

    return (
      <input
        {...rest}
        ref={mergedRef}
        type="text"
        spellCheck={false}
        defaultValue={displayValue}
        key={displayValue}
        maxLength={alpha ? 8 : 6}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    );
  },
);
