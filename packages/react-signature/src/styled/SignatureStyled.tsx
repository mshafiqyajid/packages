import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
  type CSSProperties,
} from "react";
import {
  useSignature,
  type UseSignatureOptions,
  type SignatureMode,
  type SignatureInkStyle,
} from "../useSignature";

export interface SignatureHandle {
  clear: () => void;
  getDataURL: (
    type?: "image/png" | "image/jpeg" | "image/svg+xml",
  ) => string;
  undo: () => void;
  isEmpty: () => boolean;
}

export interface SignatureStyledProps extends UseSignatureOptions {
  width?: number | string;
  height?: number;
  className?: string;
  style?: CSSProperties;
  showToolbar?: boolean;
}

function toCSSValue(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "number") return `${value}px`;
  return value;
}

export const SignatureStyled = forwardRef<
  SignatureHandle,
  SignatureStyledProps
>(function SignatureStyled(
  {
    penColor: penColorProp = "#18181b",
    penWidth: penWidthProp = 2,
    backgroundColor = "transparent",
    smoothing = true,
    velocitySensitivity = 0.7,
    minWidth = 1,
    maxWidth = 4,
    mode: modeProp = "draw",
    defaultValue,
    onBegin,
    onEnd,
    onChange,
    disabled = false,
    taper: taperProp = true,
    inkStyle: inkStyleProp = "pen",
    width = "100%",
    height = 200,
    className,
    style,
    showToolbar = false,
  },
  ref,
) {
  const [internalColor, setInternalColor] = useState(penColorProp);
  const [internalWidth, setInternalWidth] = useState(penWidthProp);
  const [internalMode, setInternalMode] = useState<SignatureMode>(modeProp);
  const [internalTaper, setInternalTaper] = useState(taperProp);
  const [internalInkStyle, setInternalInkStyle] = useState<SignatureInkStyle>(inkStyleProp);
  const [isEmptyState, setIsEmptyState] = useState(true);

  const penColor = showToolbar ? internalColor : penColorProp;
  const penWidth = showToolbar ? internalWidth : penWidthProp;
  const mode = showToolbar ? internalMode : modeProp;
  const taper = showToolbar ? internalTaper : taperProp;
  const inkStyle = showToolbar ? internalInkStyle : inkStyleProp;

  const handleChange = useCallback(
    (empty: boolean) => {
      setIsEmptyState(empty);
      onChange?.(empty);
    },
    [onChange],
  );

  const sig = useSignature({
    penColor,
    penWidth,
    backgroundColor,
    smoothing,
    velocitySensitivity,
    minWidth,
    maxWidth,
    mode,
    defaultValue,
    onBegin,
    onEnd,
    onChange: handleChange,
    disabled,
    taper,
    inkStyle,
  });

  const sigRef = useRef(sig);
  sigRef.current = sig;

  const wrapperRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      clear: () => sigRef.current.clear(),
      getDataURL: (type) => sigRef.current.getDataURL(type),
      undo: () => sigRef.current.undo(),
      isEmpty: () => sigRef.current.isEmpty,
    }),
    [],
  );

  const { canvasRef, canvasProps } = sig;
  const isEmpty = isEmptyState;

  const rootClass = ["rsig-root", className].filter(Boolean).join(" ");

  const wrapperStyle: CSSProperties = {
    width: toCSSValue(width),
    ...style,
  };

  const canvasStyle: CSSProperties = {
    ...canvasProps.style,
    width: "100%",
    height: toCSSValue(height),
    display: "block",
  };

  const inkStyleLabels: Record<SignatureInkStyle, string> = {
    pen: "Pen",
    brush: "Brush",
    marker: "Marker",
  };

  return (
    <div
      ref={wrapperRef}
      className={rootClass}
      data-disabled={disabled ? "" : undefined}
      data-empty={isEmpty ? "" : undefined}
      data-mode={mode}
      style={wrapperStyle}
    >
      <canvas
        ref={canvasRef}
        className="rsig-canvas"
        width={typeof width === "number" ? width : undefined}
        height={height}
        onPointerDown={canvasProps.onPointerDown}
        onPointerMove={canvasProps.onPointerMove}
        onPointerUp={canvasProps.onPointerUp}
        onPointerLeave={canvasProps.onPointerLeave}
        tabIndex={canvasProps.tabIndex}
        role={canvasProps.role}
        aria-label={canvasProps["aria-label"]}
        style={canvasStyle}
      />
      {showToolbar && (
        <div className="rsig-toolbar" role="toolbar" aria-label="Signature toolbar">
          <button
            type="button"
            className="rsig-btn"
            aria-pressed={internalMode === "draw"}
            data-active={internalMode === "draw" ? "" : undefined}
            onClick={() => setInternalMode("draw")}
            disabled={disabled}
          >
            Draw
          </button>
          <button
            type="button"
            className="rsig-btn"
            aria-pressed={internalMode === "erase"}
            data-active={internalMode === "erase" ? "" : undefined}
            onClick={() => setInternalMode("erase")}
            disabled={disabled}
          >
            Erase
          </button>
          <div className="rsig-toolbar-divider" />
          {(["pen", "brush", "marker"] as SignatureInkStyle[]).map((style) => (
            <button
              key={style}
              type="button"
              className="rsig-btn rsig-btn--ink"
              aria-pressed={internalInkStyle === style}
              data-active={internalInkStyle === style ? "" : undefined}
              onClick={() => setInternalInkStyle(style)}
              disabled={disabled}
              aria-label={`Ink style: ${inkStyleLabels[style]}`}
            >
              {inkStyleLabels[style]}
            </button>
          ))}
          <button
            type="button"
            className="rsig-btn rsig-btn--taper"
            aria-pressed={internalTaper}
            data-active={internalTaper ? "" : undefined}
            onClick={() => setInternalTaper((v) => !v)}
            disabled={disabled}
            aria-label="Toggle taper"
          >
            Taper
          </button>
          <div className="rsig-toolbar-spacer" />
          <label className="rsig-toolbar-label" htmlFor="rsig-color-input">
            Color
          </label>
          <input
            id="rsig-color-input"
            type="color"
            className="rsig-toolbar-color"
            value={internalColor}
            onChange={(e) => setInternalColor(e.target.value)}
            disabled={disabled}
            aria-label="Pen color"
          />
          <label className="rsig-toolbar-label" htmlFor="rsig-width-input">
            Width
          </label>
          <input
            id="rsig-width-input"
            type="range"
            className="rsig-toolbar-slider"
            min={1}
            max={10}
            step={0.5}
            value={internalWidth}
            onChange={(e) => setInternalWidth(Number(e.target.value))}
            disabled={disabled}
            aria-label="Pen width"
          />
          <div className="rsig-toolbar-spacer" />
          <button
            type="button"
            className="rsig-btn"
            onClick={() => sig.undo()}
            disabled={disabled || isEmpty}
            aria-label="Undo"
          >
            Undo
          </button>
          <button
            type="button"
            className="rsig-btn"
            onClick={() => sig.clear()}
            disabled={disabled || isEmpty}
            aria-label="Clear"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
});
