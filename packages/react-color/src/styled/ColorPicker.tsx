import { type HTMLAttributes, forwardRef } from "react";
import {
  type AnyColor,
  type HsvaColor,
  toHsva,
  hsvaToHex,
  hsvaToHsla,
  hsvaToRgba,
} from "../color";
import { AlphaSlider, HexInput, HueSlider, SaturationField } from "../primitives";
import { useColorPicker } from "../useColorPicker";

// ============================================================================
// Shared picker body (all variants render the same chrome)
// ============================================================================

interface PickerBodyProps extends HTMLAttributes<HTMLDivElement> {
  picker: ReturnType<typeof useColorPicker>;
  showAlpha: boolean;
  showHexInput: boolean;
  presets?: string[];
  disabled?: boolean;
}

const PickerBody = forwardRef<HTMLDivElement, PickerBodyProps>(
  function PickerBody({ picker, showAlpha, showHexInput, presets, disabled, className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        className={["rcp-picker", className].filter(Boolean).join(" ")}
        data-disabled={disabled ? "true" : undefined}
        {...rest}
      >
        <SaturationField picker={picker} className="rcp-saturation" />
        <div className="rcp-sliders">
          <div
            className="rcp-preview"
            style={{ background: hsvaToHex(picker.hsva) }}
            aria-hidden="true"
          />
          <div className="rcp-sliders-col">
            <HueSlider picker={picker} className="rcp-hue" />
            {showAlpha && (
              <div className="rcp-alpha-wrap">
                <AlphaSlider
                  picker={picker}
                  hsva={picker.hsva}
                  className="rcp-alpha"
                />
              </div>
            )}
          </div>
        </div>
        {showHexInput && (
          <div className="rcp-inputs">
            <div className="rcp-input-group">
              <span className="rcp-input-prefix" aria-hidden="true">#</span>
              <HexInput
                hsva={picker.hsva}
                onChange={picker.setHsva}
                alpha={showAlpha}
                className="rcp-hex-input"
                aria-label="Hex color value"
              />
            </div>
          </div>
        )}
        {presets && presets.length > 0 && (
          <div className="rcp-presets" role="listbox" aria-label="Color presets">
            {presets.map((preset) => {
              const active = hsvaToHex(picker.hsva).toLowerCase() === preset.toLowerCase();
              return (
                <button
                  key={preset}
                  type="button"
                  role="option"
                  aria-selected={active}
                  data-active={active ? "true" : undefined}
                  className="rcp-preset"
                  aria-label={preset}
                  disabled={disabled}
                  style={{ background: preset }}
                  onClick={() => {
                    if (disabled) return;
                    picker.setHsva(toHsva(preset));
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  },
);

// ============================================================================
// Shared option types
// ============================================================================

type OmitNative = "defaultValue" | "onChange";
type BaseExtras = {
  showAlpha?: boolean;
  showHexInput?: boolean;
  /** Optional swatch row rendered below the picker. Click to apply. */
  presets?: string[];
  /** Disable interaction. */
  disabled?: boolean;
};

function usePickerFor<TColor extends AnyColor>(
  value: TColor | undefined,
  defaultValue: TColor,
  onChange: ((v: TColor) => void) | undefined,
  mapOutput: (hsva: HsvaColor) => TColor,
) {
  return useColorPicker({
    value,
    defaultValue,
    onChange: onChange ? (hsva) => onChange(mapOutput(hsva)) : undefined,
  });
}

// ============================================================================
// HexColorPicker
// ============================================================================

export interface HexColorPickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, OmitNative>,
    BaseExtras {
  value?: string;
  defaultValue?: string;
  onChange?: (hex: string) => void;
}

export const HexColorPicker = forwardRef<HTMLDivElement, HexColorPickerProps>(
  function HexColorPicker(
    {
      value,
      defaultValue = "#ffffff",
      onChange,
      showAlpha = false,
      showHexInput = true,
      ...rest
    },
    ref,
  ) {
    const picker = usePickerFor(value, defaultValue, onChange, (hsva) =>
      hsvaToHex(hsva),
    );
    return (
      <PickerBody
        ref={ref}
        picker={picker}
        showAlpha={showAlpha}
        showHexInput={showHexInput}
        {...rest}
      />
    );
  },
);

// ============================================================================
// RgbColorPicker / RgbaColorPicker
// ============================================================================

export type RgbaValue = { r: number; g: number; b: number; a: number };

export interface RgbaColorPickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, OmitNative>,
    BaseExtras {
  value?: RgbaValue;
  defaultValue?: RgbaValue;
  onChange?: (rgba: RgbaValue) => void;
}

export const RgbaColorPicker = forwardRef<HTMLDivElement, RgbaColorPickerProps>(
  function RgbaColorPicker(
    {
      value,
      defaultValue = { r: 255, g: 255, b: 255, a: 1 },
      onChange,
      showAlpha = false,
      showHexInput = true,
      ...rest
    },
    ref,
  ) {
    const picker = usePickerFor(value, defaultValue, onChange, hsvaToRgba);
    return (
      <PickerBody
        ref={ref}
        picker={picker}
        showAlpha={showAlpha}
        showHexInput={showHexInput}
        {...rest}
      />
    );
  },
);

// ============================================================================
// HslaColorPicker
// ============================================================================

export type HslaValue = { h: number; s: number; l: number; a: number };

export interface HslaColorPickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, OmitNative>,
    BaseExtras {
  value?: HslaValue;
  defaultValue?: HslaValue;
  onChange?: (hsla: HslaValue) => void;
}

export const HslaColorPicker = forwardRef<HTMLDivElement, HslaColorPickerProps>(
  function HslaColorPicker(
    {
      value,
      defaultValue = { h: 0, s: 0, l: 100, a: 1 },
      onChange,
      showAlpha = false,
      showHexInput = true,
      ...rest
    },
    ref,
  ) {
    const picker = usePickerFor(value, defaultValue, onChange, hsvaToHsla);
    return (
      <PickerBody
        ref={ref}
        picker={picker}
        showAlpha={showAlpha}
        showHexInput={showHexInput}
        {...rest}
      />
    );
  },
);
