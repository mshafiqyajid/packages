import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useId,
  type RefObject,
  type CSSProperties,
} from "react";

export type SpotlightPlacement =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end";

export interface TargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpotlightStep {
  target: RefObject<Element | null> | string;
  padding?: number;
  radius?: number;
  placement?: SpotlightPlacement;
  /** Optional content for this step — passed as children in multi-step mode */
  content?: React.ReactNode;
}

export interface UseSpotlightOptions {
  /** Ref or CSS selector of the element to highlight */
  target: RefObject<Element | null> | string;
  /** Controlled open state */
  open?: boolean;
  /** Uncontrolled default open state. Default: false */
  defaultOpen?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Extra space around target in px. Default: 8 */
  padding?: number;
  /** Border radius of cutout in px. Default: 8 */
  radius?: number;
  /** Close when clicking the overlay. Default: true */
  closeOnOverlayClick?: boolean;
  /** Close on Escape key. Default: true */
  closeOnEscape?: boolean;
  /** Scroll target into view when opening. Default: true */
  scrollIntoView?: boolean;
  /** Overlay background color. Default: "rgba(0,0,0,0.6)" */
  overlayColor?: string;
  /** Placement of children relative to target. Default: "bottom" */
  placement?: SpotlightPlacement;
  /** Extra class on the overlay root */
  className?: string;
  /** Inline style override */
  style?: CSSProperties;
  /** Multi-step tour steps — overrides target/padding/radius/placement per step */
  steps?: SpotlightStep[];
  /** Controlled current step index (multi-step mode) */
  step?: number;
  /** Uncontrolled default step index. Default: 0 */
  defaultStep?: number;
  /** Called when the active step changes */
  onStepChange?: (step: number) => void;
  /** Animate a pulsing ring around the cutout. Default: false */
  pulse?: boolean;
  /** Backdrop blur in px applied to the overlay. Default: 0 */
  backdropBlur?: number;
}

export interface UseSpotlightResult {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  /** Current measured rect of the target element */
  targetRect: TargetRect | null;
  /** Props to spread on the overlay element */
  overlayProps: {
    id: string;
    role: "dialog";
    "aria-modal": true;
    "aria-label": string;
    "data-open": "" | undefined;
    "data-pulse": "" | undefined;
    onClick: (e: React.MouseEvent) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    style: CSSProperties;
    className: string;
    tabIndex: number;
  };
  /** Props to spread on the spotlight content container */
  spotlightProps: {
    style: CSSProperties;
  };
  /** Resolved padding around the target cutout in px */
  padding: number;
  /** Resolved border radius of the cutout in px */
  radius: number;
  /** Current step index (multi-step mode) */
  step: number;
  /** Total number of steps */
  totalSteps: number;
  /** Advance to the next step (clamped at last step) */
  nextStep: () => void;
  /** Go back to the previous step (clamped at first step) */
  prevStep: () => void;
  /** Jump to a specific step index */
  goToStep: (n: number) => void;
}

const FOCUSABLE_SELECTORS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "details > summary",
].join(", ");

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS),
  ).filter(
    (el) => !el.closest("[inert]") && getComputedStyle(el).display !== "none",
  );
}

function resolveTarget(
  target: RefObject<Element | null> | string,
): Element | null {
  if (typeof target === "string") {
    return document.querySelector(target);
  }
  return target.current ?? null;
}

function computeContentPosition(
  rect: TargetRect,
  placement: SpotlightPlacement,
  padding: number,
): CSSProperties {
  const GAP = 12;
  const { x, y, width, height } = rect;
  const p = padding;

  const base: CSSProperties = {
    position: "fixed",
    zIndex: 10000,
    pointerEvents: "auto",
  };

  if (placement === "bottom" || placement === "bottom-start" || placement === "bottom-end") {
    const top = y + height + p + GAP;
    let left: string | number;
    if (placement === "bottom-start") left = x - p;
    else if (placement === "bottom-end") left = x + width + p;
    else left = x + width / 2;
    return {
      ...base,
      top,
      left,
      transform:
        placement === "bottom"
          ? "translateX(-50%)"
          : placement === "bottom-end"
            ? "translateX(-100%)"
            : "none",
    };
  }
  if (placement === "top" || placement === "top-start" || placement === "top-end") {
    const bottom = window.innerHeight - (y - p - GAP);
    let left: string | number;
    if (placement === "top-start") left = x - p;
    else if (placement === "top-end") left = x + width + p;
    else left = x + width / 2;
    return {
      ...base,
      bottom,
      left,
      transform:
        placement === "top"
          ? "translateX(-50%)"
          : placement === "top-end"
            ? "translateX(-100%)"
            : "none",
    };
  }
  if (placement === "left") {
    return {
      ...base,
      top: y + height / 2,
      right: window.innerWidth - (x - p - GAP),
      transform: "translateY(-50%)",
    };
  }
  if (placement === "right") {
    return {
      ...base,
      top: y + height / 2,
      left: x + width + p + GAP,
      transform: "translateY(-50%)",
    };
  }
  return base;
}

export function useSpotlight({
  target,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  padding = 8,
  radius = 8,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  scrollIntoView = true,
  overlayColor = "rgba(0,0,0,0.6)",
  placement = "bottom",
  className = "",
  style,
  steps,
  step: controlledStep,
  defaultStep = 0,
  onStepChange,
  pulse = false,
  backdropBlur = 0,
}: UseSpotlightOptions): UseSpotlightResult {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? (controlledOpen ?? false) : internalOpen;

  const isStepControlled = controlledStep !== undefined;
  const [internalStep, setInternalStep] = useState(defaultStep);
  const currentStep = isStepControlled ? (controlledStep ?? 0) : internalStep;

  const totalSteps = steps ? steps.length : 0;

  const clampStep = useCallback(
    (n: number) => Math.max(0, Math.min(n, totalSteps - 1)),
    [totalSteps],
  );

  const setStep = useCallback(
    (n: number) => {
      const clamped = clampStep(n);
      if (!isStepControlled) setInternalStep(clamped);
      onStepChange?.(clamped);
    },
    [isStepControlled, clampStep, onStepChange],
  );

  const nextStep = useCallback(() => setStep(currentStep + 1), [currentStep, setStep]);
  const prevStep = useCallback(() => setStep(currentStep - 1), [currentStep, setStep]);
  const goToStep = useCallback((n: number) => setStep(n), [setStep]);

  // Resolve effective target/padding/radius/placement from current step when steps are provided
  const activeStep = steps ? steps[clampStep(currentStep)] : undefined;
  const effectiveTarget = activeStep ? activeStep.target : target;
  const effectivePadding = activeStep?.padding !== undefined ? activeStep.padding : padding;
  const effectiveRadius = activeStep?.radius !== undefined ? activeStep.radius : radius;
  const effectivePlacement = activeStep?.placement ?? placement;

  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const dialogId = useId();

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const open = useCallback(() => setOpen(true), [setOpen]);
  const close = useCallback(() => setOpen(false), [setOpen]);
  const toggle = useCallback(() => setOpen(!isOpen), [isOpen, setOpen]);

  const measureTarget = useCallback(() => {
    const el = resolveTarget(effectiveTarget);
    if (!el) {
      setTargetRect(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    setTargetRect({
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    });
  }, [effectiveTarget]);

  useEffect(() => {
    if (!isOpen) {
      // Delay clearing the rect so the cutout stays visible for the full
      // exit fade (--rspot-duration-out: 150ms). Clearing it immediately
      // caused the SVG to switch from cutout→solid-fill mid-fade, producing
      // a visible dark flash. 200ms matches the styled component's unmount delay.
      const t = setTimeout(() => setTargetRect(null), 200);
      return () => clearTimeout(t);
    }
    // Do NOT clear targetRect here on step changes — keeping the old rect
    // visible lets the CSS transition animate the cutout from its current
    // position to the new one. The rect is only nulled when closing.

    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const el = resolveTarget(effectiveTarget);
    if (el && scrollIntoView) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    }

    measureTarget();

    const ro = new ResizeObserver(() => measureTarget());
    if (el) ro.observe(el);
    ro.observe(document.documentElement);

    const onScroll = () => measureTarget();
    const onResize = () => measureTarget();
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onResize);
    };
  }, [isOpen, effectiveTarget, scrollIntoView, measureTarget]);

  useEffect(() => {
    if (!isOpen) {
      const prev = previousFocusRef.current;
      if (prev && typeof prev.focus === "function") {
        requestAnimationFrame(() => prev.focus());
      }
      // Reset step to 0 so next open starts from the beginning
      if (!isStepControlled) setInternalStep(defaultStep);
      return;
    }

    if (!overlayRef.current) return;
    const container = overlayRef.current;
    requestAnimationFrame(() => {
      const focusable = getFocusableElements(container);
      const first = focusable[0];
      if (first) first.focus();
      else container.focus();
    });
  }, [isOpen, isStepControlled, defaultStep]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (!closeOnOverlayClick) return;
      if (e.target === e.currentTarget) close();
    },
    [closeOnOverlayClick, close],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEscape) {
        close();
        return;
      }
      if (e.key === "Tab" && overlayRef.current) {
        const focusable = getFocusableElements(overlayRef.current);
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [closeOnEscape, close],
  );

  const contentStyle = targetRect
    ? computeContentPosition(targetRect, effectivePlacement, effectivePadding)
    : { position: "fixed" as const, zIndex: 10000, pointerEvents: "auto" as const };

  const overlayStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    ...(overlayColor ? ({ "--rspot-overlay-color": overlayColor } as CSSProperties) : {}),
    ...(backdropBlur > 0
      ? ({ "--rspot-backdrop-blur": `${backdropBlur}px` } as CSSProperties)
      : {}),
    ...style,
  };

  return {
    isOpen,
    open,
    close,
    toggle,
    targetRect,
    overlayProps: {
      id: dialogId,
      role: "dialog",
      "aria-modal": true,
      "aria-label": "Spotlight",
      "data-open": isOpen ? "" : undefined,
      "data-pulse": pulse ? "" : undefined,
      onClick: handleOverlayClick,
      onKeyDown: handleKeyDown,
      style: overlayStyle,
      className,
      tabIndex: -1,
    },
    spotlightProps: {
      style: contentStyle,
    },
    padding: effectivePadding,
    radius: effectiveRadius,
    step: clampStep(currentStep),
    totalSteps,
    nextStep,
    prevStep,
    goToStep,
  };
}
