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
export type ColorInputFormat = "hex" | "rgb" | "hsl";

export interface ColorInputStyledProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  size?: ColorInputSize;
  tone?: ColorInputTone;
  label?: string;
  hint?: string;
  error?: string;
  format?: ColorInputFormat;
  showCopyButton?: boolean;
  className?: string;
  style?: CSSProperties;
  id?: string;
  name?: string;
  autoFocus?: boolean;
  placeholder?: string;
  presets?: string[];
  /** Recent colors strip rendered above presets. Controlled. */
  recentColors?: string[];
  /** Fires after a color commit when recentColors should update. */
  onRecentColorsChange?: (colors: string[]) => void;
  /** Max length of the recent colors strip. Default 12. */
  recentColorsLimit?: number;
  showAlpha?: boolean;
  eyeDropper?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
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
      readOnly = false,
      required,
      invalid: invalidProp,
      size = "md",
      tone: toneProp = "neutral",
      label,
      hint,
      error,
      format = "hex",
      showCopyButton = false,
      className,
      style,
      id: idProp,
      name,
      autoFocus,
      placeholder,
      presets,
      recentColors,
      onRecentColorsChange,
      recentColorsLimit = 12,
      showAlpha = false,
      eyeDropper = false,
      onOpen,
      onClose,
    },
    ref,
  ) {
    const autoId = useId();
    const baseId = idProp ?? autoId;
    const inputId = `${baseId}-input`;
    const hintId = hint ? `${baseId}-hint` : undefined;
    const errorId = error ? `${baseId}-error` : undefined;

    const isInvalid = Boolean(error) || invalidProp === true;
    const tone = isInvalid ? "danger" : toneProp;

    const { inputProps, swatchProps, isOpen, close, currentHex, setHex, isValid } =
      useColorInput({ value, defaultValue, onChange, disabled });

    const [hsl, setHsl] = useState(() =>
      isValidHex(currentHex) ? hexToHsl(currentHex) : { h: 0, s: 0, l: 0 },
    );

    const [alpha, setAlpha] = useState(1);
    const [copied, setCopied] = useState(false);
    const [mounted, setMounted] = useState(false);

    const isRecentControlled = recentColors !== undefined;
    const [internalRecent, setInternalRecent] = useState<string[]>([]);
    const recentList = isRecentControlled ? recentColors! : internalRecent;
    const pushRecent = useCallback(
      (hex: string) => {
        if (!isValidHex(hex)) return;
        const next = [hex, ...recentList.filter((c) => c.toLowerCase() !== hex.toLowerCase())].slice(0, recentColorsLimit);
        if (next.length === recentList.length && next[0] === recentList[0]) return;
        if (!isRecentControlled) setInternalRecent(next);
        onRecentColorsChange?.(next);
      },
      [isRecentControlled, recentList, recentColorsLimit, onRecentColorsChange],
    );
    const supportsEyeDropper = typeof window !== "undefined" && "EyeDropper" in window;
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

    const onOpenRef = useRef(onOpen);
    onOpenRef.current = onOpen;
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    const wasOpenRef = useRef(isOpen);
    useEffect(() => {
      if (isOpen) {
        onOpenRef.current?.();
      } else {
        if (wasOpenRef.current && isValidHex(currentHex)) {
          pushRecent(currentHex);
        }
        onCloseRef.current?.();
      }
      wasOpenRef.current = isOpen;
    }, [isOpen, currentHex, pushRecent]);

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
      let text: string;
      if (format === "rgb") {
        if (showAlpha) {
          const { r, g, b } = hexToRgb(currentHex);
          text = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } else {
          text = rgbToString(hexToRgb(currentHex));
        }
      } else if (format === "hsl") {
        const { h, s, l } = hexToHsl(currentHex);
        text = showAlpha ? `hsla(${h}, ${s}%, ${l}%, ${alpha})` : `hsl(${h}, ${s}%, ${l}%)`;
      } else {
        text = currentHex;
      }
      void navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        if (copyTimer.current) clearTimeout(copyTimer.current);
        copyTimer.current = setTimeout(() => setCopied(false), 1500);
      });
    }, [currentHex, format, showAlpha, alpha]);

    useEffect(() => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    }, []);

    const handleHslInputChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const match = raw.match(/hsl\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/i);
        if (match) {
          setHex(hslToHex({ h: Number(match[1]), s: Number(match[2]), l: Number(match[3]) }));
        }
      },
      [setHex],
    );

    const displayValue = isValidHex(currentHex)
      ? format === "rgb"
        ? rgbToString(hexToRgb(currentHex))
        : format === "hsl"
          ? (() => { const { h, s, l } = hexToHsl(currentHex); return `hsl(${h}, ${s}%, ${l}%)`; })()
          : inputProps.value
      : inputProps.value;

    const classes = [
      "rci-root",
      `rci-root--${size}`,
      `rci-root--${tone}`,
      disabled ? "rci-root--disabled" : "",
      readOnly ? "rci-root--readonly" : "",
      error ? "rci-root--error" : "",
      className ?? "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        ref={ref}
        className={classes}
        style={style}
        data-size={size}
        data-tone={tone}
        data-disabled={disabled ? "true" : undefined}
        data-readonly={readOnly ? "true" : undefined}
        data-invalid={isInvalid ? "true" : undefined}
      >
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
            style={
              {
                "--rci-swatch-color": showAlpha
                  ? (() => { const { r, g, b } = hexToRgb(currentHex); return `rgba(${r}, ${g}, ${b}, ${alpha})`; })()
                  : currentHex,
              } as CSSProperties
            }
          />
          <input
            {...inputProps}
            id={inputId}
            name={name}
            className="rci-input"
            value={displayValue}
            placeholder={placeholder}
            required={required}
            readOnly={readOnly}
            autoFocus={autoFocus}
            onChange={
              format === "hex"
                ? inputProps.onChange
                : format === "hsl"
                  ? handleHslInputChange
                  : handleHexInputChange
            }
            aria-invalid={isInvalid || !isValid ? "true" : undefined}
            aria-required={required ? "true" : undefined}
            aria-describedby={
              [hintId, errorId].filter(Boolean).join(" ") || undefined
            }
            spellCheck={false}
            autoComplete="off"
          />
          {eyeDropper && supportsEyeDropper && (
            <button
              type="button"
              className="rci-eyedropper-btn"
              aria-label="Pick color from screen"
              disabled={disabled}
              onClick={() => {
                const dropper = new (window as any).EyeDropper();
                dropper.open().then((result: any) => {
                  setHex(result.sRGBHex);
                  if (onChange) onChange(result.sRGBHex);
                }).catch(() => { /* user cancelled */ });
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M10.5 1.5a1.5 1.5 0 0 1 2 2L5 11l-3 1 1-3 7.5-7.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
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
              {showAlpha && (
                <input
                  type="range"
                  className="rci-alpha-slider"
                  min={0}
                  max={1}
                  step={0.01}
                  value={alpha}
                  aria-label="Alpha (opacity)"
                  onChange={(e) => setAlpha(Number(e.target.value))}
                />
              )}
              <div className="rci-hex-row">
                <div
                  className="rci-preview"
                  style={
                    {
                      "--rci-swatch-color": showAlpha
                        ? (() => { const { r, g, b } = hexToRgb(currentHex); return `rgba(${r}, ${g}, ${b}, ${alpha})`; })()
                        : currentHex,
                    } as CSSProperties
                  }
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
              {recentList.length > 0 && (
                <div className="rci-presets rci-recents" aria-label="Recent colors">
                  {recentList.map((color) => (
                    <button
                      key={`recent-${color}`}
                      type="button"
                      className="rci-preset"
                      aria-label={color}
                      data-active={currentHex === color ? "true" : undefined}
                      style={{ "--rci-swatch-color": color } as CSSProperties}
                      onClick={() => setHex(color)}
                    />
                  ))}
                </div>
              )}
              {(presets === undefined || presets.length > 0) && (
                <div className="rci-presets">
                  {(presets ?? PRESETS).map((preset) => (
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
              )}
            </div>,
            document.body,
          )}
      </div>
    );
  },
);
