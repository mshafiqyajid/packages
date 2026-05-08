import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

export interface UseCarouselOptions {
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
  /** Enable touch/pointer swipe. Default: true */
  swipe?: boolean;
  /** Enable mouse drag. Default: true */
  drag?: boolean;
  /** Min px distance to commit a swipe. Default: 50 */
  dragThreshold?: number;
  onSwipeStart?: () => void;
  onSwipeEnd?: (committed: boolean) => void;
  renderDot?: (index: number, active: boolean) => ReactNode;
  renderArrow?: (dir: "prev" | "next", disabled: boolean) => ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Slide transition style. Default: "slide" */
  transitionEffect?: "slide" | "fade";
  /** Show sliver of adjacent slides (px or CSS string). Default: 0 */
  peek?: number | string;
  /** Show "N / M" counter overlay. Default: false */
  counter?: boolean;
  /** Show progress bar during autoPlay. Default: false */
  autoPlayProgress?: boolean;
}

export interface UseCarouselResult {
  /** Props for the outer wrapper element */
  containerProps: {
    role: "region";
    "aria-label": string;
    "aria-roledescription": "carousel";
    "data-orientation": "horizontal" | "vertical";
    "data-dragging": "true" | undefined;
    "data-loop": "true" | undefined;
    "data-autoplay": "true" | undefined;
    onPointerEnter: () => void;
    onPointerLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
    onKeyDown: (e: ReactKeyboardEvent) => void;
  };
  /** Props for the slide track element */
  trackProps: {
    "aria-live": "polite" | "off";
    style: CSSProperties;
    onPointerDown: (e: ReactPointerEvent) => void;
    onPointerMove: (e: ReactPointerEvent) => void;
    onPointerUp: (e: ReactPointerEvent) => void;
    onPointerCancel: (e: ReactPointerEvent) => void;
  };
  /** Factory: returns props for each slide element */
  getSlideProps: (slideIndex: number) => {
    role: "group";
    "aria-roledescription": "slide";
    "aria-label": string;
    "aria-hidden": boolean;
    style: CSSProperties;
  };
  /** Props for the prev button */
  prevProps: {
    "aria-label": string;
    "aria-disabled": boolean;
    disabled: boolean;
    onClick: () => void;
    tabIndex: number;
  };
  /** Props for the next button */
  nextProps: {
    "aria-label": string;
    "aria-disabled": boolean;
    disabled: boolean;
    onClick: () => void;
    tabIndex: number;
  };
  /** Factory: returns props for each dot button */
  getDotProps: (dotIndex: number) => {
    "aria-label": string;
    "aria-current": boolean;
    onClick: () => void;
    tabIndex: number;
  };
  /** Current active index */
  index: number;
  setIndex: (i: number) => void;
  prev: () => void;
  next: () => void;
  isPaused: boolean;
  pause: () => void;
  resume: () => void;
  isDragging: boolean;
  /** Current drag offset in px (for live feedback) */
  dragOffset: number;
  total: number;
  /** Increments on each slide change — use as React key to reset progress animation */
  progressKey: number;
}

export function useCarousel({
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
  swipe = true,
  drag = true,
  dragThreshold = 50,
  onSwipeStart,
  onSwipeEnd,
  transitionEffect = "slide",
}: UseCarouselOptions): UseCarouselResult {
  const isControlled = controlledIndex !== undefined;
  const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultIndex);
  const activeIndex = isControlled ? controlledIndex : uncontrolledIndex;

  const [isPausedByUser, setIsPausedByUser] = useState(false);
  const [isPausedByInteraction, setIsPausedByInteraction] = useState(false);
  const isPaused = isPausedByUser || isPausedByInteraction;

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [progressKey, setProgressKey] = useState(0);

  const total = items.length;
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const currentDragOffsetRef = useRef(0);
  const isFocusedRef = useRef(false);
  const isHoveredRef = useRef(false);

  const clampIndex = useCallback(
    (i: number): number => {
      if (loop) return ((i % total) + total) % total;
      return Math.max(0, Math.min(i, total - 1));
    },
    [loop, total],
  );

  const goTo = useCallback(
    (i: number) => {
      const next = clampIndex(i);
      if (!isControlled) setUncontrolledIndex(next);
      onIndexChange?.(next);
      setProgressKey((k) => k + 1);
    },
    [isControlled, onIndexChange, clampIndex],
  );

  const prev = useCallback(() => {
    if (!loop && activeIndex === 0) return;
    goTo(activeIndex - 1);
  }, [goTo, activeIndex, loop]);

  const next = useCallback(() => {
    if (!loop && activeIndex === total - 1) return;
    goTo(activeIndex + 1);
  }, [goTo, activeIndex, loop, total]);

  const pause = useCallback(() => setIsPausedByUser(true), []);
  const resume = useCallback(() => setIsPausedByUser(false), []);

  const clearAutoPlay = useCallback(() => {
    if (autoPlayRef.current !== null) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  }, []);

  const startAutoPlay = useCallback(() => {
    clearAutoPlay();
    if (!autoPlay || isPaused) return;
    autoPlayRef.current = setInterval(() => {
      if (!loop) {
        setUncontrolledIndex((prev) => {
          const next = prev + 1;
          if (next >= total) {
            clearAutoPlay();
            return prev;
          }
          onIndexChange?.(next);
          return next;
        });
      } else {
        if (!isControlled) {
          setUncontrolledIndex((prev) => {
            const next = ((prev + 1) % total + total) % total;
            onIndexChange?.(next);
            return next;
          });
        } else {
          next();
        }
      }
    }, autoPlayInterval);
  }, [autoPlay, isPaused, loop, total, autoPlayInterval, clearAutoPlay, isControlled, next, onIndexChange]);

  useEffect(() => {
    startAutoPlay();
    return clearAutoPlay;
  }, [startAutoPlay, clearAutoPlay]);

  const handlePointerEnter = useCallback(() => {
    isHoveredRef.current = true;
    if (pauseOnHover) setIsPausedByInteraction(true);
  }, [pauseOnHover]);

  const handlePointerLeave = useCallback(() => {
    isHoveredRef.current = false;
    if (!isFocusedRef.current) setIsPausedByInteraction(false);
  }, []);

  const handleFocus = useCallback(() => {
    isFocusedRef.current = true;
    if (pauseOnFocus) setIsPausedByInteraction(true);
  }, [pauseOnFocus]);

  const handleBlur = useCallback(() => {
    isFocusedRef.current = false;
    if (!isHoveredRef.current) setIsPausedByInteraction(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent) => {
      const isHorizontal = orientation === "horizontal";
      const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp";
      const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown";

      if (e.key === prevKey) {
        e.preventDefault();
        prev();
      } else if (e.key === nextKey) {
        e.preventDefault();
        next();
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(total - 1);
      }
    },
    [orientation, prev, next, goTo, total],
  );

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent) => {
      if (!swipe && !drag) return;
      if (e.pointerType === "mouse" && !drag) return;
      if (e.pointerType !== "mouse" && !swipe) return;

      dragStartRef.current = { x: e.clientX, y: e.clientY };
      currentDragOffsetRef.current = 0;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      setIsDragging(true);
      setDragOffset(0);
      onSwipeStart?.();
    },
    [swipe, drag, onSwipeStart],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent) => {
      if (!dragStartRef.current) return;
      const isHorizontal = orientation === "horizontal";
      const delta = isHorizontal
        ? e.clientX - dragStartRef.current.x
        : e.clientY - dragStartRef.current.y;
      currentDragOffsetRef.current = delta;
      setDragOffset(delta);
    },
    [orientation],
  );

  const commitDrag = useCallback(
    (cancelled: boolean) => {
      if (!dragStartRef.current) return;
      const offset = currentDragOffsetRef.current;
      const committed = !cancelled && Math.abs(offset) >= dragThreshold;
      dragStartRef.current = null;
      currentDragOffsetRef.current = 0;
      setIsDragging(false);
      setDragOffset(0);
      onSwipeEnd?.(committed);
      if (committed) {
        if (offset < 0) next();
        else prev();
      }
    },
    [dragThreshold, next, prev, onSwipeEnd],
  );

  const handlePointerUp = useCallback(
    (e: ReactPointerEvent) => {
      void e;
      commitDrag(false);
    },
    [commitDrag],
  );

  const handlePointerCancel = useCallback(
    (e: ReactPointerEvent) => {
      void e;
      commitDrag(true);
    },
    [commitDrag],
  );

  const isHorizontal = orientation === "horizontal";
  const isAtStart = activeIndex === 0;
  const isAtEnd = activeIndex === total - 1;
  const prevDisabled = !loop && isAtStart;
  const nextDisabled = !loop && isAtEnd;

  const getTrackTransform = (): string => {
    if (transitionEffect === "fade") {
      return "translateX(0px)";
    }

    // Resolve gap to a number of px. spacing can be 0, 8, "8px", etc.
    const gapPx =
      typeof spacing === "number"
        ? spacing
        : parseFloat(String(spacing)) || 0;

    const axis = isHorizontal ? "X" : "Y";

    // Correct step per index: (viewport + gap) / slidesPerView
    //   = (100% / n) + (gap / n px)
    // This accounts for the CSS flex gap pushing slide positions.
    const stepPct = 100 / slidesPerView;
    const stepPx  = gapPx / slidesPerView;

    if (activeIndex === 0 && !isDragging) {
      return `translate${axis}(0px)`;
    }

    const indexPart =
      activeIndex !== 0 ? `${-activeIndex} * (${stepPct}% + ${stepPx}px)` : null;
    const dragPart  =
      isDragging && dragOffset !== 0 ? `${dragOffset}px` : null;
    const parts     = [indexPart, dragPart].filter(Boolean).join(" + ");

    return `translate${axis}(calc(${parts}))`;
  };

  const trackStyle: CSSProperties = {
    transform: getTrackTransform(),
    transition: isDragging ? "none" : undefined,
    willChange: "transform",
  };

  return {
    containerProps: {
      role: "region",
      "aria-label": "Carousel",
      "aria-roledescription": "carousel",
      "data-orientation": orientation,
      "data-dragging": isDragging ? "true" : undefined,
      "data-loop": loop ? "true" : undefined,
      "data-autoplay": autoPlay ? "true" : undefined,
      onPointerEnter: handlePointerEnter,
      onPointerLeave: handlePointerLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
    },
    trackProps: {
      "aria-live": isDragging ? "off" : "polite",
      style: trackStyle,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
    },
    getSlideProps: (slideIndex: number) => ({
      role: "group",
      "aria-roledescription": "slide",
      "aria-label": `${slideIndex + 1} of ${total}`,
      "aria-hidden": slideIndex !== activeIndex,
      style: {
        flexShrink: 0,
        width: `calc(100% / ${slidesPerView})`,
      },
    }),
    prevProps: {
      "aria-label": "Previous slide",
      "aria-disabled": prevDisabled,
      disabled: prevDisabled,
      onClick: prev,
      tabIndex: 0,
    },
    nextProps: {
      "aria-label": "Next slide",
      "aria-disabled": nextDisabled,
      disabled: nextDisabled,
      onClick: next,
      tabIndex: 0,
    },
    getDotProps: (dotIndex: number) => ({
      "aria-label": `Go to slide ${dotIndex + 1}`,
      "aria-current": dotIndex === activeIndex,
      onClick: () => goTo(dotIndex),
      tabIndex: 0,
    }),
    index: activeIndex,
    setIndex: goTo,
    prev,
    next,
    isPaused,
    pause,
    resume,
    isDragging,
    dragOffset,
    total,
    progressKey,
  };
}
