import {
  useRef,
  useCallback,
  useEffect,
  type RefObject,
  type PointerEvent as ReactPointerEvent,
} from "react";

export type SignatureMode = "draw" | "erase";
export type SignatureInkStyle = "pen" | "brush" | "marker";

export interface UseSignatureOptions {
  penColor?: string;
  penWidth?: number;
  backgroundColor?: string;
  smoothing?: boolean;
  velocitySensitivity?: number;
  minWidth?: number;
  maxWidth?: number;
  mode?: SignatureMode;
  defaultValue?: string;
  onBegin?: () => void;
  onEnd?: (dataURL: string) => void;
  onChange?: (isEmpty: boolean) => void;
  disabled?: boolean;
  taper?: boolean;
  inkStyle?: SignatureInkStyle;
}

export interface SignaturePoint {
  x: number;
  y: number;
  time: number;
  pressure?: number;
}

export interface SignatureStroke {
  points: SignaturePoint[];
  color: string;
  minWidth: number;
  maxWidth: number;
  velocitySensitivity: number;
  smoothing: boolean;
  mode: SignatureMode;
  taper: boolean;
  inkStyle: SignatureInkStyle;
}

export interface UseSignatureResult {
  canvasRef: RefObject<HTMLCanvasElement>;
  canvasProps: {
    onPointerDown: (e: ReactPointerEvent<HTMLCanvasElement>) => void;
    onPointerMove: (e: ReactPointerEvent<HTMLCanvasElement>) => void;
    onPointerUp: (e: ReactPointerEvent<HTMLCanvasElement>) => void;
    onPointerLeave: (e: ReactPointerEvent<HTMLCanvasElement>) => void;
    tabIndex: number;
    role: "img";
    "aria-label": string;
    style: React.CSSProperties;
  };
  isEmpty: boolean;
  mode: SignatureMode;
  clear: () => void;
  getDataURL: (type?: "image/png" | "image/jpeg" | "image/svg+xml") => string;
  undo: () => void;
}

function getCanvasPoint(
  canvas: HTMLCanvasElement,
  e: ReactPointerEvent<HTMLCanvasElement>,
): SignaturePoint {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
    time: Date.now(),
    pressure: e.pressure,
  };
}

function calculateVelocity(
  p1: SignaturePoint,
  p2: SignaturePoint,
): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const dt = Math.max(p2.time - p1.time, 1);
  return distance / dt;
}

function velocityToWidth(
  velocity: number,
  velocitySensitivity: number,
  minWidth: number,
  maxWidth: number,
): number {
  if (velocitySensitivity === 0) return (minWidth + maxWidth) / 2;
  const maxVelocity = 2.5;
  const normalized = Math.min(velocity / maxVelocity, 1);
  const widthRange = maxWidth - minWidth;
  return maxWidth - normalized * widthRange * velocitySensitivity;
}

function getTaperMultiplier(index: number, total: number, taperLength: number): number {
  if (total <= 1 || taperLength <= 0) return 1;
  const taperIn = Math.min(index / taperLength, 1);
  const taperOut = Math.min((total - 1 - index) / taperLength, 1);
  const ease = (t: number) => t * t * (3 - 2 * t);
  return ease(Math.min(taperIn, taperOut));
}

function replayStrokesOnCanvas(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  strokes: SignatureStroke[],
  backgroundColor: string,
): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (backgroundColor && backgroundColor !== "transparent") {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  for (const stroke of strokes) {
    drawStrokeOnContext(ctx, stroke);
  }
}

function drawStrokeOnContext(
  ctx: CanvasRenderingContext2D,
  stroke: SignatureStroke,
): void {
  const {
    points,
    color,
    minWidth,
    maxWidth,
    velocitySensitivity,
    smoothing,
    mode,
    taper,
    inkStyle,
  } = stroke;
  if (points.length === 0) return;

  const prevComposite = ctx.globalCompositeOperation;
  const prevAlpha = ctx.globalAlpha;
  if (mode === "erase") {
    ctx.globalCompositeOperation = "destination-out";
  }

  ctx.strokeStyle = mode === "erase" ? "rgba(0,0,0,1)" : color;
  ctx.fillStyle = mode === "erase" ? "rgba(0,0,0,1)" : color;

  // marker: square caps, no velocity, no taper
  if (inkStyle === "marker") {
    ctx.lineCap = "square";
    ctx.lineJoin = "miter";
  } else {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }

  const taperLength = Math.min(6, Math.floor(points.length / 3));
  const isMarker = inkStyle === "marker";
  const isBrush = inkStyle === "brush";

  // seed for brush alpha so replay is deterministic per-stroke
  let brushSeed = 0;
  function nextBrushAlpha(): number {
    // simple LCG for repeatable pseudo-random sequence per stroke segment
    brushSeed = (brushSeed * 1664525 + 1013904223) & 0xffffffff;
    const norm = ((brushSeed >>> 0) / 0xffffffff);
    return 0.85 + norm * 0.15;
  }

  if (points.length === 1) {
    const p = points[0]!;
    const r = (minWidth + maxWidth) / 4;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = prevComposite;
    ctx.globalAlpha = prevAlpha;
    return;
  }

  if (!smoothing || points.length < 3 || isMarker) {
    ctx.beginPath();
    const first = points[0]!;
    ctx.moveTo(first.x, first.y);
    for (let i = 1; i < points.length; i++) {
      const p = points[i]!;
      const prev = points[i - 1]!;

      let width: number;
      if (isMarker) {
        width = (minWidth + maxWidth) / 2;
      } else {
        const velocity = calculateVelocity(prev, p);
        width = velocityToWidth(velocity, velocitySensitivity, minWidth, maxWidth);
      }

      if (taper && !isMarker) {
        const taperMultiplier = getTaperMultiplier(i, points.length, taperLength);
        ctx.lineWidth = width * Math.max(taperMultiplier, 0.1);
      } else {
        ctx.lineWidth = width;
      }

      if (isBrush) {
        ctx.globalAlpha = nextBrushAlpha();
      }

      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    }
    ctx.globalCompositeOperation = prevComposite;
    ctx.globalAlpha = prevAlpha;
    return;
  }

  // Draw from p0 to midpoint(p0,p1) so the stroke starts exactly at the touch point
  {
    const p0 = points[0]!;
    const p1 = points[1]!;
    const startWidth = velocityToWidth(0, velocitySensitivity, minWidth, maxWidth);
    ctx.lineWidth = taper ? startWidth * 0.1 : startWidth;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo((p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
    ctx.stroke();
  }

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1]!;
    const curr = points[i]!;
    const next = points[i + 1]!;

    const velocity = calculateVelocity(prev, curr);
    let width = velocityToWidth(velocity, velocitySensitivity, minWidth, maxWidth);

    if (isBrush) {
      ctx.globalAlpha = nextBrushAlpha();
      // brush uses slightly more pronounced velocity sensitivity
      width = velocityToWidth(velocity, Math.min(velocitySensitivity * 1.3, 1), minWidth, maxWidth);
    }

    if (taper) {
      const taperMultiplier = getTaperMultiplier(i, points.length, taperLength);
      ctx.lineWidth = width * Math.max(taperMultiplier, 0.1);
    } else {
      ctx.lineWidth = width;
    }

    ctx.beginPath();
    const midX = (curr.x + next.x) / 2;
    const midY = (curr.y + next.y) / 2;
    ctx.moveTo((prev.x + curr.x) / 2, (prev.y + curr.y) / 2);
    ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
    ctx.stroke();
  }

  const secondLast = points[points.length - 2]!;
  const last = points[points.length - 1]!;
  const velocity = calculateVelocity(secondLast, last);
  let width = velocityToWidth(velocity, velocitySensitivity, minWidth, maxWidth);

  if (isBrush) {
    ctx.globalAlpha = nextBrushAlpha();
  }

  if (taper) {
    const lastIdx = points.length - 1;
    const taperMultiplier = getTaperMultiplier(lastIdx, points.length, taperLength);
    ctx.lineWidth = width * Math.max(taperMultiplier, 0.1);
  } else {
    ctx.lineWidth = width;
  }

  ctx.beginPath();
  ctx.moveTo(
    (secondLast.x + last.x) / 2,
    (secondLast.y + last.y) / 2,
  );
  ctx.lineTo(last.x, last.y);
  ctx.stroke();

  ctx.globalCompositeOperation = prevComposite;
  ctx.globalAlpha = prevAlpha;
}

export function useSignature({
  penColor = "#18181b",
  penWidth = 2,
  backgroundColor = "transparent",
  smoothing = true,
  velocitySensitivity = 0.7,
  minWidth = 1,
  maxWidth = 4,
  mode = "draw",
  defaultValue,
  onBegin,
  onEnd,
  onChange,
  disabled = false,
  taper = true,
  inkStyle = "pen",
}: UseSignatureOptions = {}): UseSignatureResult {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<SignaturePoint[]>([]);
  const strokesRef = useRef<SignatureStroke[]>([]);
  const isEmptyRef = useRef(true);
  const animFrameRef = useRef<number | null>(null);
  const pendingPointsRef = useRef<SignaturePoint[]>([]);
  const defaultValueLoadedRef = useRef(false);

  const penColorRef = useRef(penColor);
  const penWidthRef = useRef(penWidth);
  const backgroundColorRef = useRef(backgroundColor);
  const smoothingRef = useRef(smoothing);
  const velocitySensitivityRef = useRef(velocitySensitivity);
  const minWidthRef = useRef(minWidth);
  const maxWidthRef = useRef(maxWidth);
  const modeRef = useRef(mode);
  const onBeginRef = useRef(onBegin);
  const onEndRef = useRef(onEnd);
  const onChangeRef = useRef(onChange);
  const disabledRef = useRef(disabled);
  const taperRef = useRef(taper);
  const inkStyleRef = useRef(inkStyle);

  penColorRef.current = penColor;
  penWidthRef.current = penWidth;
  backgroundColorRef.current = backgroundColor;
  smoothingRef.current = smoothing;
  velocitySensitivityRef.current = velocitySensitivity;
  minWidthRef.current = minWidth;
  maxWidthRef.current = maxWidth;
  modeRef.current = mode;
  onBeginRef.current = onBegin;
  onEndRef.current = onEnd;
  onChangeRef.current = onChange;
  disabledRef.current = disabled;
  taperRef.current = taper;
  inkStyleRef.current = inkStyle;

  const getCtx = useCallback((): CanvasRenderingContext2D | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  }, []);

  const setIsEmpty = useCallback(
    (val: boolean) => {
      if (isEmptyRef.current !== val) {
        isEmptyRef.current = val;
        onChangeRef.current?.(val);
      }
    },
    [],
  );

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    strokesRef.current = [];
    currentStrokeRef.current = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (
      backgroundColorRef.current &&
      backgroundColorRef.current !== "transparent"
    ) {
      ctx.fillStyle = backgroundColorRef.current;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    setIsEmpty(true);
  }, [getCtx, setIsEmpty]);

  const getDataURL = useCallback(
    (type: "image/png" | "image/jpeg" | "image/svg+xml" = "image/png"): string => {
      const canvas = canvasRef.current;
      if (!canvas) return "";
      if (type === "image/svg+xml") {
        const w = canvas.width;
        const h = canvas.height;
        const paths: string[] = [];
        for (const stroke of strokesRef.current) {
          if (stroke.points.length === 0) continue;
          const pts = stroke.points;
          let d = `M ${pts[0]!.x} ${pts[0]!.y}`;
          for (let i = 1; i < pts.length; i++) {
            d += ` L ${pts[i]!.x} ${pts[i]!.y}`;
          }
          paths.push(
            `<path d="${d}" stroke="${stroke.color}" stroke-width="${(stroke.minWidth + stroke.maxWidth) / 2}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
          );
        }
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${paths.join("")}</svg>`;
        return `data:image/svg+xml;base64,${btoa(svg)}`;
      }
      return canvas.toDataURL(type);
    },
    [],
  );

  const undo = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    if (strokesRef.current.length === 0) return;
    strokesRef.current = strokesRef.current.slice(0, -1);
    replayStrokesOnCanvas(
      ctx,
      canvas,
      strokesRef.current,
      backgroundColorRef.current,
    );
    setIsEmpty(strokesRef.current.length === 0);
  }, [getCtx, setIsEmpty]);

  const renderCurrentStroke = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const newPoints = pendingPointsRef.current;
    if (newPoints.length === 0) return;
    pendingPointsRef.current = [];

    const allPoints = currentStrokeRef.current;
    const startIdx = Math.max(0, allPoints.length - 2);

    const _vSens = velocitySensitivityRef.current;
    const _pw = penWidthRef.current;
    const _scale = _pw / 2;
    const partialStroke: SignatureStroke = {
      points: allPoints.slice(startIdx),
      color: penColorRef.current,
      minWidth: _vSens === 0 ? _pw : minWidthRef.current * _scale,
      maxWidth: _vSens === 0 ? _pw : maxWidthRef.current * _scale,
      velocitySensitivity: _vSens,
      smoothing: smoothingRef.current,
      mode: modeRef.current,
      // disable taper on the live 2-point preview segment — taper only makes
      // sense on the full replayed stroke where we know the total point count
      taper: false,
      inkStyle: inkStyleRef.current,
    };

    drawStrokeOnContext(ctx, partialStroke);
    animFrameRef.current = null;
  }, [getCtx]);

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (disabledRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.setPointerCapture(e.pointerId);
      isDrawingRef.current = true;
      currentStrokeRef.current = [];
      pendingPointsRef.current = [];
      const point = getCanvasPoint(canvas, e);
      currentStrokeRef.current.push(point);
      onBeginRef.current?.();
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current || disabledRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const point = getCanvasPoint(canvas, e);
      currentStrokeRef.current.push(point);
      pendingPointsRef.current.push(point);

      if (animFrameRef.current === null) {
        animFrameRef.current = requestAnimationFrame(renderCurrentStroke);
      }
    },
    [renderCurrentStroke],
  );

  const handlePointerUp = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current || disabledRef.current) return;
      isDrawingRef.current = false;

      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }

      const canvas = canvasRef.current;
      const ctx = getCtx();
      if (!canvas || !ctx) return;

      const vSens = velocitySensitivityRef.current;
      const pw = penWidthRef.current;
      const scale = pw / 2; // 2 is the default penWidth
      const stroke: SignatureStroke = {
        points: [...currentStrokeRef.current],
        color: penColorRef.current,
        minWidth: vSens === 0 ? pw : minWidthRef.current * scale,
        maxWidth: vSens === 0 ? pw : maxWidthRef.current * scale,
        velocitySensitivity: vSens,
        smoothing: smoothingRef.current,
        mode: modeRef.current,
        taper: taperRef.current,
        inkStyle: inkStyleRef.current,
      };

      strokesRef.current = [...strokesRef.current, stroke];
      replayStrokesOnCanvas(
        ctx,
        canvas,
        strokesRef.current,
        backgroundColorRef.current,
      );

      currentStrokeRef.current = [];
      setIsEmpty(false);
      onEndRef.current?.(getDataURL());
      canvas.releasePointerCapture(e.pointerId);
    },
    [getCtx, setIsEmpty, getDataURL],
  );

  const handlePointerLeave = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (isDrawingRef.current) {
        handlePointerUp(e);
      }
    },
    [handlePointerUp],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (backgroundColor && backgroundColor !== "transparent") {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [backgroundColor]);

  useEffect(() => {
    if (!defaultValue || defaultValueLoadedRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    defaultValueLoadedRef.current = true;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      isEmptyRef.current = false;
      onChangeRef.current?.(false);
    };
    img.src = defaultValue;
  }, [defaultValue]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return {
    canvasRef,
    canvasProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerLeave,
      tabIndex: disabled ? -1 : 0,
      role: "img",
      "aria-label": "Signature pad",
      style: { touchAction: "none" },
    },
    get isEmpty() {
      return isEmptyRef.current;
    },
    mode,
    clear,
    getDataURL,
    undo,
  };
}
