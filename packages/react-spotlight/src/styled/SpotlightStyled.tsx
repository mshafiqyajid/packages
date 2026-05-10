import {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useCallback,
  useId,
  type ReactNode,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import {
  useSpotlight,
  type SpotlightPlacement,
  type SpotlightStep,
  type TargetRect,
} from "../useSpotlight";

export interface SpotlightStyledProps {
  /** Ref or CSS selector of the element to highlight */
  target: React.RefObject<Element | null> | string;
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
  /** Tooltip/popover content shown near the target */
  children?: ReactNode;
  /** Placement of children relative to target. Default: "bottom" */
  placement?: SpotlightPlacement;
  /** Extra class on the overlay root */
  className?: string;
  /** Inline style override */
  style?: CSSProperties;
  /** Convenience trigger slot — renders a button that toggles the spotlight */
  trigger?: ReactNode;
  /** Multi-step tour steps */
  steps?: SpotlightStep[];
  /** Controlled current step index */
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

const MORPH_TRANSITION =
  "x 320ms cubic-bezier(0.4,0,0.2,1), y 320ms cubic-bezier(0.4,0,0.2,1), width 320ms cubic-bezier(0.4,0,0.2,1), height 320ms cubic-bezier(0.4,0,0.2,1)";

function SpotlightSVG({
  rect,
  padding,
  radius,
  overlayColor,
  pulse,
  animate,
  maskId,
}: {
  rect: TargetRect;
  padding: number;
  radius: number;
  overlayColor: string;
  pulse: boolean;
  animate: boolean;
  maskId: string;
}) {
  const x = rect.x - padding;
  const y = rect.y - padding;
  const w = rect.width + padding * 2;
  const h = rect.height + padding * 2;

  return (
    <svg
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      <defs>
        <mask id={maskId}>
          <rect width="100%" height="100%" fill="white" />
          <rect
            className="rspot-mask-rect"
            style={{
              x,
              y,
              width: w,
              height: h,
              rx: radius,
              transition: animate ? MORPH_TRANSITION : "none",
            } as CSSProperties}
            fill="black"
          />
        </mask>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill={overlayColor}
        mask={`url(#${maskId})`}
      />
      {pulse && (
        <rect
          className="rspot-pulse-ring"
          style={{
            x,
            y,
            width: w,
            height: h,
            rx: radius,
            pointerEvents: "none",
          } as CSSProperties}
          fill="none"
          stroke="white"
          strokeOpacity="0.6"
          strokeWidth="2"
        />
      )}
    </svg>
  );
}

export const SpotlightStyled = forwardRef<HTMLDivElement, SpotlightStyledProps>(
  function SpotlightStyled(
    {
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
      children,
      placement = "bottom",
      className,
      style,
      trigger,
      steps,
      step: controlledStep,
      defaultStep,
      onStepChange,
      pulse = false,
      backdropBlur = 0,
    },
    ref,
  ) {
    const [mounted, setMounted] = useState(false);
    const [rendered, setRendered] = useState(false);
    const [visible, setVisible] = useState(false);
    const overlayElRef = useRef<HTMLDivElement | null>(null);
    const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasAnimatedRef = useRef(false);
    const rawMaskId = useId();
    // useId returns strings like ":r0:" — strip colons so they're valid in url()
    const maskId = `rspot-mask-${rawMaskId.replace(/:/g, "")}`;

    const {
      isOpen,
      close,
      toggle,
      targetRect,
      overlayProps,
      spotlightProps,
      padding: effectivePadding,
      radius: effectiveRadius,
      step,
      totalSteps,
      nextStep,
      prevStep,
      goToStep,
    } = useSpotlight({
      target,
      open: controlledOpen,
      defaultOpen,
      onOpenChange,
      padding,
      radius,
      closeOnOverlayClick,
      closeOnEscape,
      scrollIntoView,
      overlayColor,
      placement,
      className,
      style,
      steps,
      step: controlledStep,
      defaultStep,
      onStepChange,
      pulse,
      backdropBlur,
    });

    useEffect(() => {
      setMounted(true);
    }, []);

    // Track whether the first rect has been shown — enables morph transition on
    // subsequent step changes while keeping the initial appearance instant.
    useEffect(() => {
      if (targetRect) {
        hasAnimatedRef.current = true;
      } else {
        // Reset when closed so next open starts instant again
        hasAnimatedRef.current = false;
      }
    }, [targetRect]);

    useEffect(() => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
      if (isOpen) {
        setRendered(true);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setVisible(true));
        });
      } else {
        setVisible(false);
        exitTimerRef.current = setTimeout(() => setRendered(false), 200);
      }
      return () => {
        if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      };
    }, [isOpen]);

    const setOverlayRef = useCallback(
      (el: HTMLDivElement | null) => {
        overlayElRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
      },
      [ref],
    );

    const resolvedOverlayColor = overlayColor ?? "rgba(0,0,0,0.6)";

    // backdrop-filter on the overlay itself would blur the cutout area too.
    // Instead we use a separate masked layer — see the blur-layer div below.
    const overlayStyleWithBlur: CSSProperties = overlayProps.style;

    const isMultiStep = steps && steps.length > 0;
    const activeStepContent = steps && steps[step]?.content;
    const renderedChildren = isMultiStep ? activeStepContent : children;

    return (
      <>
        {trigger !== undefined && (
          <span
            className="rspot-trigger"
            onClick={toggle}
            style={{ display: "contents" }}
          >
            {trigger}
          </span>
        )}
        {mounted &&
          rendered &&
          createPortal(
            <div
              {...overlayProps}
              ref={setOverlayRef}
              className={[
                "rspot-overlay",
                visible ? "rspot-overlay--visible" : "",
                pulse ? "rspot-overlay--pulse" : "",
                isMultiStep ? "rspot-overlay--tour" : "",
                className,
              ]
                .filter(Boolean)
                .join(" ")}
              style={overlayStyleWithBlur}
            >
              {/* Blur layer: same SVG mask punches a hole so the cutout stays sharp.
                  Rendered whenever backdropBlur>0 so CSS can fade-in the blur value. */}
              {backdropBlur > 0 && (
                <div
                  aria-hidden="true"
                  className={`rspot-blur-layer${visible ? " rspot-blur-layer--visible" : ""}`}
                  style={{
                    "--rspot-target-blur": `${backdropBlur}px`,
                    ...(targetRect
                      ? { mask: `url(#${maskId})`, WebkitMask: `url(#${maskId})` }
                      : {}),
                  } as CSSProperties}
                />
              )}
              {targetRect ? (
                <SpotlightSVG
                  rect={targetRect}
                  padding={effectivePadding}
                  radius={effectiveRadius}
                  overlayColor={resolvedOverlayColor}
                  pulse={pulse}
                  animate={hasAnimatedRef.current}
                  maskId={maskId}
                />
              ) : (
                <svg
                  aria-hidden="true"
                  style={{
                    position: "fixed",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                  }}
                >
                  <rect
                    width="100%"
                    height="100%"
                    fill={resolvedOverlayColor}
                  />
                </svg>
              )}
              {(renderedChildren !== undefined || isMultiStep) && (
                <div
                  {...spotlightProps}
                  key={isMultiStep ? step : undefined}
                  className={["rspot-content", isMultiStep ? "rspot-content--step-change" : ""].filter(Boolean).join(" ")}
                >
                  {renderedChildren}
                  {isMultiStep && (
                    <div className="rspot-nav">
                      <button
                        type="button"
                        className="rspot-nav__btn rspot-nav__btn--prev"
                        onClick={prevStep}
                        disabled={step === 0}
                        aria-label="Previous step"
                      >
                        ←
                      </button>
                      <div className="rspot-nav__dots">
                        {Array.from({ length: totalSteps }, (_, i) => (
                          <button
                            key={i}
                            type="button"
                            className={`rspot-nav__dot${i === step ? " rspot-nav__dot--active" : ""}`}
                            onClick={() => goToStep(i)}
                            aria-label={`Go to step ${i + 1}`}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        className={`rspot-nav__btn rspot-nav__btn--next${step === totalSteps - 1 ? " rspot-nav__btn--done" : ""}`}
                        onClick={step === totalSteps - 1 ? close : nextStep}
                        aria-label={step === totalSteps - 1 ? "Finish tour" : "Next step"}
                      >
                        {step === totalSteps - 1 ? "Done" : "→"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>,
            document.body,
          )}
      </>
    );
  },
);
