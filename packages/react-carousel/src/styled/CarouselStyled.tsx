import { forwardRef, type ReactNode, type CSSProperties } from "react";
import { useCarousel } from "../useCarousel";

export interface CarouselStyledProps {
  items: ReactNode[];
  /** Controlled active index */
  index?: number;
  /** Uncontrolled initial index. Default: 0 */
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  /** "horizontal" | "vertical". Default: "horizontal" */
  orientation?: "horizontal" | "vertical";
  /** Wrap around at boundaries. Default: true */
  loop?: boolean;
  /** Auto-advance slides. Default: false */
  autoPlay?: boolean;
  /** Auto-advance interval in ms. Default: 4000 */
  autoPlayInterval?: number;
  /** Pause autoPlay on hover. Default: true */
  pauseOnHover?: boolean;
  /** Pause autoPlay on focus. Default: true */
  pauseOnFocus?: boolean;
  /** Number of slides visible at once. Default: 1 */
  slidesPerView?: number;
  /** Gap between slides (CSS value or number → px). Default: 0 */
  spacing?: number | string;
  /** Show dot indicators. Default: true */
  showDots?: boolean;
  /** Show prev/next arrow buttons. Default: true */
  showArrows?: boolean;
  /** Enable touch/pointer swipe. Default: true */
  swipe?: boolean;
  /** Enable mouse drag. Default: true */
  drag?: boolean;
  /** Min px distance to commit a swipe. Default: 50 */
  dragThreshold?: number;
  onSwipeStart?: () => void;
  onSwipeEnd?: (committed: boolean) => void;
  /** Custom dot renderer: (index, isActive) => ReactNode */
  renderDot?: (index: number, active: boolean) => ReactNode;
  /** Custom arrow renderer: (dir, isDisabled) => ReactNode */
  renderArrow?: (dir: "prev" | "next", disabled: boolean) => ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Slide transition style. Default: "slide" */
  transitionEffect?: "slide" | "fade";
  /** Show sliver of adjacent slides (px number or CSS string like "10%"). Default: 0 */
  peek?: number | string;
  /** Show "N / M" counter overlay. Default: false */
  counter?: boolean;
  /** Show progress bar during autoPlay. Default: false */
  autoPlayProgress?: boolean;
}

function ChevronLeft() {
  return (
    <svg className="rcar-arrow-icon" viewBox="0 0 16 16" aria-hidden="true">
      <polyline points="10 4 6 8 10 12" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg className="rcar-arrow-icon" viewBox="0 0 16 16" aria-hidden="true">
      <polyline points="6 4 10 8 6 12" />
    </svg>
  );
}

function ChevronUp() {
  return (
    <svg className="rcar-arrow-icon" viewBox="0 0 16 16" aria-hidden="true">
      <polyline points="4 10 8 6 12 10" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg className="rcar-arrow-icon" viewBox="0 0 16 16" aria-hidden="true">
      <polyline points="4 6 8 10 12 6" />
    </svg>
  );
}

export const CarouselStyled = forwardRef<HTMLDivElement, CarouselStyledProps>(
  function CarouselStyled(
    {
      items,
      index: controlledIndex,
      defaultIndex = 0,
      onIndexChange,
      orientation = "horizontal",
      loop = true,
      autoPlay = false,
      autoPlayInterval = 4000,
      pauseOnHover = true,
      pauseOnFocus = true,
      slidesPerView = 1,
      spacing = 0,
      showDots = true,
      showArrows = true,
      swipe = true,
      drag = true,
      dragThreshold = 50,
      onSwipeStart,
      onSwipeEnd,
      renderDot,
      renderArrow,
      className,
      style,
      transitionEffect = "slide",
      peek = 0,
      counter = false,
      autoPlayProgress = false,
    },
    ref,
  ) {
    const {
      containerProps,
      trackProps,
      getSlideProps,
      prevProps,
      nextProps,
      getDotProps,
      index,
      total,
      isPaused,
      progressKey,
    } = useCarousel({
      items,
      index: controlledIndex,
      defaultIndex,
      onIndexChange,
      orientation,
      loop,
      autoPlay,
      autoPlayInterval,
      pauseOnHover,
      pauseOnFocus,
      slidesPerView,
      spacing,
      swipe,
      drag,
      dragThreshold,
      onSwipeStart,
      onSwipeEnd,
      transitionEffect,
    });

    const isHorizontal = orientation === "horizontal";
    const gapValue =
      spacing === 0 || spacing === "0"
        ? "0px"
        : typeof spacing === "number"
          ? `${spacing}px`
          : spacing;

    const trackStyle: CSSProperties = {
      ...trackProps.style,
      gap: gapValue,
    };

    const slideWidthStyle =
      slidesPerView > 1
        ? `calc((100% - (${slidesPerView - 1}) * ${gapValue}) / ${slidesPerView})`
        : "100%";

    const peekValue =
      peek === 0
        ? "0px"
        : typeof peek === "number"
          ? `${peek}px`
          : peek;

    const hasPeek = peek !== 0 && peek !== "0" && peek !== "0px";

    const isAtStart = !loop && index === 0;
    const isAtEnd   = !loop && index === total - 1;

    const viewportStyle: CSSProperties = hasPeek
      ? {
          overflow: "visible",
          ...(isHorizontal
            ? {
                paddingLeft:  isAtStart ? "0px" : peekValue,
                paddingRight: isAtEnd   ? "0px" : peekValue,
              }
            : {
                paddingTop:    isAtStart ? "0px" : peekValue,
                paddingBottom: isAtEnd   ? "0px" : peekValue,
              }),
        }
      : {};

    return (
      <div
        ref={ref}
        className={["rcar-root", className].filter(Boolean).join(" ")}
        style={style}
        tabIndex={0}
        data-transition={transitionEffect !== "slide" ? transitionEffect : undefined}
        data-peek={hasPeek ? "true" : undefined}
        data-counter={counter ? "true" : undefined}
        {...containerProps}
      >
        <div className="rcar-viewport" style={viewportStyle}>
          <div
            className="rcar-track"
            {...trackProps}
            style={trackStyle}
          >
            {items.map((item, i) => {
              const slideProps = getSlideProps(i);
              return (
                <div
                  key={i}
                  className="rcar-slide"
                  {...slideProps}
                  aria-hidden={slideProps["aria-hidden"] ? "true" : "false"}
                  style={{
                    ...slideProps.style,
                    width: isHorizontal ? slideWidthStyle : "100%",
                    height: isHorizontal ? "100%" : slideWidthStyle,
                    flexShrink: 0,
                  }}
                >
                  {item}
                </div>
              );
            })}
          </div>
        </div>

        {showArrows && (
          <div className="rcar-arrows">
            <button
              type="button"
              className="rcar-arrow rcar-arrow--prev"
              {...prevProps}
            >
              {renderArrow
                ? renderArrow("prev", prevProps.disabled)
                : isHorizontal
                  ? <ChevronLeft />
                  : <ChevronUp />}
            </button>
            <button
              type="button"
              className="rcar-arrow rcar-arrow--next"
              {...nextProps}
            >
              {renderArrow
                ? renderArrow("next", nextProps.disabled)
                : isHorizontal
                  ? <ChevronRight />
                  : <ChevronDown />}
            </button>
          </div>
        )}

        {showDots && (
          <div className="rcar-dots" aria-label="Slide indicators">
            {Array.from({ length: total }, (_, i) => {
              const dotProps = getDotProps(i);
              return (
                <button
                  key={i}
                  type="button"
                  className="rcar-dot"
                  {...dotProps}
                  aria-current={dotProps["aria-current"] ? "true" : undefined}
                >
                  {renderDot ? renderDot(i, i === index) : null}
                </button>
              );
            })}
          </div>
        )}

        {counter && (
          <div className="rcar-counter" aria-live="polite" aria-atomic="true">
            {index + 1} / {total}
          </div>
        )}

        {autoPlayProgress && autoPlay && (
          <div className="rcar-progress" key={progressKey}>
            <div
              className="rcar-progress-bar"
              data-playing={!isPaused ? "true" : undefined}
              style={{ animationDuration: `${autoPlayInterval}ms` }}
            />
          </div>
        )}
      </div>
    );
  },
);
