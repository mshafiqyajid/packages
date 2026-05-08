import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useLightbox } from "../useLightbox";

export interface LightboxImage {
  src: string;
  alt: string;
  caption?: string;
  thumb?: string;
  width?: number;
  height?: number;
}

export interface LightboxStyledProps {
  images: LightboxImage[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  loop?: boolean;
  showThumbnails?: boolean;
  showCaption?: boolean;
  showCounter?: boolean;
  showClose?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  swipe?: boolean;
  zoom?: boolean;
  maxZoom?: number;
  onClose?: () => void;
  renderCaption?: (image: LightboxImage, index: number) => ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const LightboxStyled = forwardRef<HTMLDivElement, LightboxStyledProps>(
  function LightboxStyled(
    {
      images,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      index: indexProp,
      defaultIndex = 0,
      onIndexChange,
      loop = true,
      showThumbnails = true,
      showCaption = true,
      showCounter = true,
      showClose = true,
      closeOnOverlayClick = true,
      closeOnEsc = true,
      swipe = true,
      zoom = false,
      maxZoom = 3,
      onClose,
      renderCaption,
      className,
      style,
    },
    ref,
  ) {
    const total = images.length;
    const liveRegionId = useId();
    const thumbnailsRef = useRef<HTMLDivElement>(null);

    const {
      isOpen,
      close,
      index,
      setIndex,
      prev,
      next,
      zoomLevel,
      setZoomLevel,
      direction,
    } = useLightbox({
      open: openProp,
      defaultOpen,
      onOpenChange,
      index: indexProp,
      defaultIndex,
      onIndexChange,
      total,
      loop,
      closeOnEsc,
      zoom,
      maxZoom,
      onClose,
    });

    const [mounted, setMounted] = useState(false);
    const [rendered, setRendered] = useState(false);
    const [visible, setVisible] = useState(false);
    const [imgKey, setImgKey] = useState(0);
    const [imgVisible, setImgVisible] = useState(true);

    const previouslyFocusedRef = useRef<HTMLElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const imgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const reducedMotion = useRef(false);
    useEffect(() => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      reducedMotion.current = mq.matches;
      const handler = (e: MediaQueryListEvent) => { reducedMotion.current = e.matches; };
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }, []);

    useEffect(() => { setMounted(true); }, []);

    // Transition in/out
    useEffect(() => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      if (isOpen) {
        setRendered(true);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setVisible(true));
        });
      } else {
        setVisible(false);
        closeTimerRef.current = setTimeout(() => setRendered(false), 240);
      }
      return () => {
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      };
    }, [isOpen]);

    // Focus management
    useEffect(() => {
      if (isOpen) {
        previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
        requestAnimationFrame(() => {
          containerRef.current?.focus();
        });
      } else {
        const target = previouslyFocusedRef.current;
        if (target && typeof target.focus === "function") {
          requestAnimationFrame(() => target.focus());
        }
      }
    }, [isOpen]);

    // Focus trap
    useEffect(() => {
      if (!isOpen || !containerRef.current) return;
      const el = containerRef.current;
      const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key !== "Tab") return;
        const focusables = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (focusables.length === 0) return;
        const first = focusables[0]!;
        const last = focusables[focusables.length - 1]!;
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      };
      el.addEventListener("keydown", onKeyDown);
      return () => el.removeEventListener("keydown", onKeyDown);
    }, [isOpen, rendered]);

    // Image cross-fade on index change
    const prevIndexRef = useRef(index);
    useEffect(() => {
      if (prevIndexRef.current === index) return;
      prevIndexRef.current = index;

      if (imgTimerRef.current) clearTimeout(imgTimerRef.current);
      if (reducedMotion.current) {
        setImgKey((k) => k + 1);
        return;
      }
      setImgVisible(false);
      imgTimerRef.current = setTimeout(() => {
        setImgKey((k) => k + 1);
        setImgVisible(true);
      }, 100);
      return () => {
        if (imgTimerRef.current) clearTimeout(imgTimerRef.current);
      };
    }, [index]);

    // Reset imgVisible when key changes
    useEffect(() => {
      setImgVisible(true);
    }, [imgKey]);

    // Scroll active thumbnail into view
    useEffect(() => {
      if (!showThumbnails || !thumbnailsRef.current) return;
      const thumb = thumbnailsRef.current.querySelector<HTMLElement>(`[data-thumb-index="${index}"]`);
      if (thumb) {
        thumb.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }, [index, showThumbnails]);

    // Swipe / pointer events
    const swipeStartXRef = useRef<number | null>(null);
    const swipeStartYRef = useRef<number | null>(null);

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
      if (!swipe || e.pointerType === "mouse") return;
      swipeStartXRef.current = e.clientX;
      swipeStartYRef.current = e.clientY;
    }, [swipe]);

    const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
      if (swipeStartXRef.current === null || swipeStartYRef.current === null) return;
      const dx = e.clientX - swipeStartXRef.current;
      const dy = e.clientY - swipeStartYRef.current;
      swipeStartXRef.current = null;
      swipeStartYRef.current = null;
      if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
      if (dx < 0) next();
      else prev();
    }, [next, prev]);

    // Zoom via scroll wheel
    const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
      if (!zoom) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.25 : 0.25;
      setZoomLevel(zoomLevel + delta);
    }, [zoom, zoomLevel, setZoomLevel]);

    const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if (!closeOnOverlayClick) return;
      if (e.target === e.currentTarget) close();
    }, [closeOnOverlayClick, close]);

    // Announce slide changes to screen readers
    const currentImage = images[index];
    const liveText = currentImage
      ? `Image ${index + 1} of ${total}${currentImage.alt ? `: ${currentImage.alt}` : ""}`
      : "";

    const setContainerRef = useCallback(
      (el: HTMLDivElement | null) => {
        containerRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
      },
      [ref],
    );

    if (!mounted || !rendered) return null;

    const caption = renderCaption && currentImage
      ? renderCaption(currentImage, index)
      : currentImage?.caption;

    const canPrev = loop || index > 0;
    const canNext = loop || index < total - 1;

    return createPortal(
      <div
        className={["rlbx-overlay", visible ? "rlbx-overlay--visible" : ""].filter(Boolean).join(" ")}
        data-state={visible ? "open" : "closed"}
        onClick={handleOverlayClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {/* Live region for screen reader announcements */}
        <div
          id={liveRegionId}
          className="rlbx-live"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {isOpen ? liveText : ""}
        </div>

        {/* Main lightbox container */}
        <div
          ref={setContainerRef}
          role="dialog"
          aria-modal={true}
          aria-label="Image viewer"
          aria-describedby={liveRegionId}
          tabIndex={-1}
          className={["rlbx-container", className].filter(Boolean).join(" ")}
          data-state={visible ? "open" : "closed"}
          data-index={index}
          data-total={total}
          data-zoom-active={zoomLevel > 1 ? "true" : undefined}
          style={style}
          onWheel={handleWheel}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Counter */}
          {showCounter && total > 1 && (
            <div className="rlbx-counter" aria-hidden="true">
              {index + 1} / {total}
            </div>
          )}

          {/* Close button */}
          {showClose && (
            <button
              type="button"
              className="rlbx-close"
              aria-label="Close image viewer"
              onClick={close}
            >
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}

          {/* Prev button */}
          {total > 1 && (
            <button
              type="button"
              className="rlbx-nav rlbx-nav--prev"
              aria-label="Previous image"
              disabled={!canPrev}
              onClick={(e) => { e.stopPropagation(); prev(); }}
            >
              <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {/* Image area */}
          <div className="rlbx-image-area">
            {currentImage && (
              <img
                key={imgKey}
                src={currentImage.src}
                alt={currentImage.alt}
                width={currentImage.width}
                height={currentImage.height}
                className={[
                  "rlbx-image",
                  imgVisible ? "rlbx-image--visible" : "",
                  direction === "prev" ? "rlbx-image--from-left" : "",
                  direction === "next" ? "rlbx-image--from-right" : "",
                ].filter(Boolean).join(" ")}
                style={
                  zoomLevel !== 1
                    ? { transform: `scale(${zoomLevel})`, cursor: "zoom-in" }
                    : undefined
                }
                draggable={false}
              />
            )}
          </div>

          {/* Next button */}
          {total > 1 && (
            <button
              type="button"
              className="rlbx-nav rlbx-nav--next"
              aria-label="Next image"
              disabled={!canNext}
              onClick={(e) => { e.stopPropagation(); next(); }}
            >
              <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {/* Zoom controls */}
          {zoom && (
            <div className="rlbx-zoom-controls">
              <button
                type="button"
                className="rlbx-zoom-btn"
                aria-label="Zoom out"
                onClick={(e) => { e.stopPropagation(); setZoomLevel(zoomLevel - 0.5); }}
                disabled={zoomLevel <= 1}
              >
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <span className="rlbx-zoom-level" aria-label={`Zoom ${Math.round(zoomLevel * 100)}%`}>
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                className="rlbx-zoom-btn"
                aria-label="Zoom in"
                onClick={(e) => { e.stopPropagation(); setZoomLevel(zoomLevel + 0.5); }}
                disabled={zoomLevel >= maxZoom}
              >
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}

          {/* Caption */}
          {showCaption && caption && (
            <div className="rlbx-caption">{caption}</div>
          )}
        </div>

        {/* Thumbnail strip */}
        {showThumbnails && total > 1 && (
          <div
            ref={thumbnailsRef}
            className="rlbx-thumbnails"
            role="tablist"
            aria-label="Image thumbnails"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                className={["rlbx-thumb", i === index ? "rlbx-thumb--active" : ""].filter(Boolean).join(" ")}
                data-thumb-index={i}
                aria-label={img.alt || `Image ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                aria-selected={i === index ? "true" : "false"}
                onClick={() => { setIndex(i); }}
              >
                <img
                  src={img.thumb ?? img.src}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                />
              </button>
            ))}
          </div>
        )}
      </div>,
      document.body,
    );
  },
);
