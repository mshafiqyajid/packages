import {
  forwardRef,
  useRef,
  useState,
  useCallback,
  useEffect,
  useId,
  type ChangeEvent,
  type MouseEvent,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { useColorInput } from "../useColorInput";
import {
  hexToHsl,
  hslToHex,
  hueToHex,
  rgbToString,
  hexToRgb,
  isValidHex,
} from "../colorUtils";

export type ColorInputSize = "sm" | "md" | "lg";
export type ColorInputTone = "neutral" | "primary" | "danger";
export type ColorInputFormat = "hex" | "rgb";

export interface ColorInputStyledProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  size?: ColorInputSize;
  tone?: ColorInputTone;
  label?: string;
  hint?: string;
  error?: string;
  format?: ColorInputFormat;
  showCopyButton?: boolean;
  className?: string;
}

const PRESETS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#ffffff",
  "#94a3b8",
  "#334155",
  "#000000",
];

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

interface GradientPickerProps {
  hue: number;
  saturation: number;
  lightness: number;
  onChangeSL: (s: number, l: number) => void;
}

function GradientPicker({ hue, saturation, lightness, onChangeSL }: GradientPickerProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const xPct = saturation;
  const yPct = 100 - lightness;

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const el = canvasRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = clamp((clientX - rect.left) / rect.width, 0, 1);
      const y = clamp((clientY - rect.top) / rect.height, 0, 1);
      onChangeSL(Math.round(x * 100), Math.round((1 - y) * 100));
    },
    [onChangeSL],
  );

  const onMouseDown = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      dragging.current = true;
      updateFromPointer(e.clientX, e.clientY);
    },
    [updateFromPointer],
  );

  useEffect(() => {
    const onMove = (e: globalThis.MouseEvent) => {
      if (!dragging.current) return;
      updateFromPointer(e.clientX, e.clientY);
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [updateFromPointer]);

  const hueColor = hueToHex(hue);

  return (
    <div
      ref={canvasRef}
      className="rci-gradient"
      onMouseDown={onMouseDown}
      style={
        {
          "--rci-hue-color": hueColor,
          position: "relative",
        } as CSSProperties
      }
    >
      <div className="rci-gradient-white" />
      <div className="rci-gradient-black" />
      <div
        className="rci-gradient-thumb"
        style={{ left: `${xPct}%`, top: `${yPct}%` }}
      />
    </div>
  );
}

interface HueSliderProps {
  hue: number;
  onChange: (hue: number) => void;
}

function HueSlider({ hue, onChange }: HueSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateFromPointer = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = clamp((clientX - rect.left) / rect.width, 0, 1);
      onChange(Math.round(x * 360));
    },
    [onChange],
  );

  const onMouseDown = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      dragging.current = true;
      updateFromPointer(e.clientX);
    },
    [updateFromPointer],
  );

  useEffect(() => {
    const onMove = (e: globalThis.MouseEvent) => {
      if (!dragging.current) return;
      updateFromPointer(e.clientX);
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [updateFromPointer]);

  return (
    <div ref={trackRef} className="rci-hue-track" onMouseDown={onMouseDown}>
      <div
        className="rci-hue-thumb"
        style={{ left: `${(hue / 360) * 100}%` }}
      />
    </div>
  );
}

export const ColorInputStyled = forwardRef<HTMLDivElement, ColorInputStyledProps>(
  function ColorInputStyled(
    {
      value,
      defaultValue = "#000000",
      onChange,
      disabled = false,
      size = "md",
      tone: toneProp = "neutral",
      label,
      hint,
      error,
      format = "hex",
      showCopyButton = false,
      className,
    },
    ref,
  ) {
    const id = useId();
    const inputId = `${id}input`;
    const hintId = hint ? `${id}hint` : undefined;
    const errorId = error ? `${id}error` : undefined;

    const tone = error ? "danger" : toneProp;

    const { inputProps, swatchProps, isOpen, close, currentHex, setHex, isValid } =
      useColorInput({ value, defaultValue, onChange, disabled });

    const [hsl, setHsl] = useState(() =>
      isValidHex(currentHex) ? hexToHsl(currentHex) : { h: 0, s: 0, l: 0 },
    );

    const [copied, setCopied] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [popoverPos, setPopoverPos] = useState<{ top: number; left: number }>({
      top: -9999,
      left: -9999,
    });

    const wrapperRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
      if (isValidHex(currentHex)) {
        setHsl(hexToHsl(currentHex));
      }
    }, [currentHex]);

    const updatePopoverPos = useCallback(() => {
      if (!wrapperRef.current || !popoverRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const pop = popoverRef.current.getBoundingClientRect();
      const sx = window.scrollX;
      const sy = window.scrollY;
      let top = rect.bottom + sy + 6;
      let left = rect.left + sx;
      if (left + pop.width > window.innerWidth + sx - 8) {
        left = rect.right + sx - pop.width;
      }
      if (top + pop.height > window.innerHeight + sy - 8) {
        top = rect.top + sy - pop.height - 6;
      }
      setPopoverPos({ top, left });
    }, []);

    useEffect(() => {
      if (isOpen) {
        requestAnimationFrame(updatePopoverPos);
      }
    }, [isOpen, updatePopoverPos]);

    useEffect(() => {
      if (!isOpen) return;
      const onScroll = () => updatePopoverPos();
      const onResize = () => updatePopoverPos();
      const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
      const onPointerDown = (e: PointerEvent) => {
        if (
          popoverRef.current &&
          !popoverRef.current.contains(e.target as Node) &&
          wrapperRef.current &&
          !wrapperRef.current.contains(e.target as Node)
        ) {
          close();
        }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize, { passive: true });
      document.addEventListener("keydown", onKey);
      document.addEventListener("pointerdown", onPointerDown);
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        document.removeEventListener("keydown", onKey);
        document.removeEventListener("pointerdown", onPointerDown);
      };
    }, [isOpen, close, updatePopoverPos]);

    const handleHueChange = useCallback(
      (h: number) => {
        const newHsl = { ...hsl, h };
        setHsl(newHsl);
        setHex(hslToHex(newHsl));
      },
      [hsl, setHex],
    );

    const handleSLChange = useCallback(
      (s: number, l: number) => {
        const newHsl = { ...hsl, s, l };
        setHsl(newHsl);
        setHex(hslToHex(newHsl));
      },
      [hsl, setHex],
    );

    const handleHexInputChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const candidate = raw.startsWith("#") ? raw : `#${raw}`;
        if (isValidHex(candidate)) {
          setHex(candidate);
        }
      },
      [setHex],
    );

    const handleCopy = useCallback(() => {
      const text = format === "rgb"
        ? rgbToString(hexToRgb(currentHex))
        : currentHex;
      void navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        if (copyTimer.current) clearTimeout(copyTimer.current);
        copyTimer.current = setTimeout(() => setCopied(false), 1500);
      });
    }, [currentHex, format]);

    useEffect(() => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    }, []);

    const displayValue =
      format === "rgb" && isValidHex(currentHex)
        ? rgbToString(hexToRgb(currentHex))
        : inputProps.value;

    const classes = [
      "rci-root",
      `rci-root--${size}`,
      `rci-root--${tone}`,
      disabled ? "rci-root--disabled" : "",
      error ? "rci-root--error" : "",
      className ?? "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} className={classes}>
        {label && (
          <label htmlFor={inputId} className="rci-label">
            {label}
          </label>
        )}
        <div ref={wrapperRef} className="rci-field">
          <button
            {...swatchProps}
            className="rci-swatch"
            aria-label="Open color picker"
            style={{ "--rci-swatch-color": currentHex } as CSSProperties}
          />
          <input
            {...inputProps}
            id={inputId}
            className="rci-input"
            value={displayValue}
            onChange={
              format === "hex"
                ? inputProps.onChange
                : handleHexInputChange
            }
            aria-invalid={!isValid || !!error}
            aria-describedby={
              [hintId, errorId].filter(Boolean).join(" ") || undefined
            }
            spellCheck={false}
            autoComplete="off"
          />
          {showCopyButton && (
            <button
              type="button"
              className="rci-copy-btn"
              onClick={handleCopy}
              disabled={disabled}
              aria-label={copied ? "Copied!" : "Copy color"}
            >
              {copied ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M2 10V2h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          )}
        </div>
        {hint && !error && (
          <span id={hintId} className="rci-hint">
            {hint}
          </span>
        )}
        {error && (
          <span id={errorId} className="rci-error" role="alert">
            {error}
          </span>
        )}
        {mounted &&
          createPortal(
            <div
              ref={popoverRef}
              className="rci-popover"
              role="dialog"
              aria-label="Color picker"
              data-open={isOpen ? "true" : undefined}
              style={
                {
                  position: "absolute",
                  top: popoverPos.top,
                  left: popoverPos.left,
                  zIndex: 9999,
                } as CSSProperties
              }
            >
              <GradientPicker
                hue={hsl.h}
                saturation={hsl.s}
                lightness={hsl.l}
                onChangeSL={handleSLChange}
              />
              <HueSlider hue={hsl.h} onChange={handleHueChange} />
              <div className="rci-hex-row">
                <div
                  className="rci-preview"
                  style={{ "--rci-swatch-color": currentHex } as CSSProperties}
                />
                <input
                  className="rci-hex-input"
                  value={currentHex}
                  onChange={handleHexInputChange}
                  spellCheck={false}
                  autoComplete="off"
                  maxLength={7}
                  aria-label="Hex color value"
                />
              </div>
              <div className="rci-presets">
                {PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className="rci-preset"
                    aria-label={preset}
                    data-active={currentHex === preset ? "true" : undefined}
                    style={{ "--rci-swatch-color": preset } as CSSProperties}
                    onClick={() => setHex(preset)}
                  />
                ))}
              </div>
            </div>,
            document.body,
          )}
      </div>
    );
  },
);
