import {
  type CSSProperties,
  type PointerEvent,
  type RefObject,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type AnyColor,
  type HsvaColor,
  clamp,
  toHsva,
} from "./color";

export interface UseColorPickerOptions {
  /** Controlled color value — any supported format. */
  value?: AnyColor;
  /** Initial value when uncontrolled. Default: "#ffffff". */
  defaultValue?: AnyColor;
  /** Called whenever the color changes (during pointer drag). */
  onChange?: (hsva: HsvaColor) => void;
}

export interface UseColorPickerResult {
  /** Current HSVA color. */
  hsva: HsvaColor;
  /** Set the full HSVA value. */
  setHsva: (next: HsvaColor) => void;
  /** Props for the saturation-brightness 2D field. */
  saturationFieldProps: {
    ref: RefObject<HTMLDivElement | null>;
    style: CSSProperties;
    onPointerDown: (e: PointerEvent<HTMLDivElement>) => void;
  };
  /** Current saturation-brightness pointer position as % (0-100). */
  sbPosition: { left: number; top: number };
  /** Props for the hue slider (horizontal). */
  hueSliderProps: {
    ref: RefObject<HTMLDivElement | null>;
    onPointerDown: (e: PointerEvent<HTMLDivElement>) => void;
  };
  /** Hue position as % (0-100). */
  huePosition: number;
  /** Props for the alpha slider (horizontal). */
  alphaSliderProps: {
    ref: RefObject<HTMLDivElement | null>;
    onPointerDown: (e: PointerEvent<HTMLDivElement>) => void;
  };
  /** Alpha position as % (0-100). */
  alphaPosition: number;
}

function getOffset(el: HTMLElement, e: { clientX: number; clientY: number }) {
  const rect = el.getBoundingClientRect();
  const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
  const y = clamp((e.clientY - rect.top) / rect.height, 0, 1);
  return { x, y };
}

function getHorizontalOffset(el: HTMLElement, e: { clientX: number }) {
  const rect = el.getBoundingClientRect();
  return clamp((e.clientX - rect.left) / rect.width, 0, 1);
}

export function useColorPicker(options: UseColorPickerOptions = {}): UseColorPickerResult {
  const {
    value: controlledValue,
    defaultValue = "#ffffff",
    onChange,
  } = options;

  const isControlled = controlledValue !== undefined;

  const [internalHsva, setInternalHsva] = useState<HsvaColor>(() =>
    toHsva(defaultValue),
  );

  const hsva: HsvaColor = isControlled
    ? toHsva(controlledValue!)
    : internalHsva;

  const commit = useCallback(
    (next: HsvaColor) => {
      if (!isControlled) setInternalHsva(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const setHsva = useCallback((next: HsvaColor) => commit(next), [commit]);

  // Saturation-Brightness 2D field
  const sbRef = useRef<HTMLDivElement | null>(null);

  const handleSbPointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      const el = sbRef.current;
      if (!el) return;
      e.currentTarget.setPointerCapture(e.pointerId);

      const move = (ev: globalThis.PointerEvent) => {
        if (!el) return;
        const { x, y } = getOffset(el, ev);
        commit({ ...hsva, s: Math.round(x * 100), v: Math.round((1 - y) * 100) });
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      // Also fire on the initial press
      const { x, y } = getOffset(el, e);
      commit({ ...hsva, s: Math.round(x * 100), v: Math.round((1 - y) * 100) });
    },
    [hsva, commit],
  );

  // Hue slider
  const hueRef = useRef<HTMLDivElement | null>(null);

  const handleHuePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      const el = hueRef.current;
      if (!el) return;
      e.currentTarget.setPointerCapture(e.pointerId);

      const move = (ev: globalThis.PointerEvent) => {
        if (!el) return;
        const x = getHorizontalOffset(el, ev);
        commit({ ...hsva, h: Math.round(x * 360) });
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      commit({ ...hsva, h: Math.round(getHorizontalOffset(el, e) * 360) });
    },
    [hsva, commit],
  );

  // Alpha slider
  const alphaRef = useRef<HTMLDivElement | null>(null);

  const handleAlphaPointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      const el = alphaRef.current;
      if (!el) return;
      e.currentTarget.setPointerCapture(e.pointerId);

      const move = (ev: globalThis.PointerEvent) => {
        if (!el) return;
        const x = getHorizontalOffset(el, ev);
        commit({ ...hsva, a: Math.round(x * 100) / 100 });
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      commit({ ...hsva, a: Math.round(getHorizontalOffset(el, e) * 100) / 100 });
    },
    [hsva, commit],
  );

  const sbPosition = useMemo(
    () => ({ left: hsva.s, top: 100 - hsva.v }),
    [hsva.s, hsva.v],
  );

  const saturationFieldProps = useMemo(
    () => ({
      ref: sbRef,
      style: {
        backgroundColor: `hsl(${hsva.h}, 100%, 50%)`,
      } as CSSProperties,
      onPointerDown: handleSbPointerDown,
    }),
    [hsva.h, handleSbPointerDown],
  );

  const hueSliderProps = useMemo(
    () => ({ ref: hueRef, onPointerDown: handleHuePointerDown }),
    [handleHuePointerDown],
  );

  const alphaSliderProps = useMemo(
    () => ({ ref: alphaRef, onPointerDown: handleAlphaPointerDown }),
    [handleAlphaPointerDown],
  );

  return {
    hsva,
    setHsva,
    saturationFieldProps,
    sbPosition,
    hueSliderProps,
    huePosition: hsva.h / 360 * 100,
    alphaSliderProps,
    alphaPosition: hsva.a * 100,
  };
}
