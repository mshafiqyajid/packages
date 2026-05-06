import {
  type CSSProperties,
  type ReactNode,
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  useTabs,
  type TabsActivation,
  type TabsChangeReason,
  type TabsOrientation,
} from "../useTabs";

export type TabsVariant = "line" | "solid" | "pill";
export type TabsSize = "sm" | "md" | "lg";
export type TabsTone = "neutral" | "primary" | "success" | "danger";

export interface TabItem {
  value: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
  /** When true, renders a × button on the tab. Pair with `onTabClose`. */
  closable?: boolean;
}

export interface TabsRenderTabContext {
  tab: TabItem;
  index: number;
  isActive: boolean;
  isDisabled: boolean;
}

export interface TabsRenderPanelContext {
  tab: TabItem;
  isActive: boolean;
}

export interface TabsStyledProps {
  tabs: TabItem[];
  variant?: TabsVariant;
  size?: TabsSize;
  tone?: TabsTone;
  defaultValue?: string;
  value?: string;
  /** Optional second arg reports the trigger reason ("click" | "keyboard" | "programmatic"). */
  onChange?: (value: string, reason: TabsChangeReason) => void;
  /** "automatic" (default) — arrow keys move focus AND activate. "manual" — arrows move focus only. */
  activation?: TabsActivation;
  /** Affects keyboard nav direction. Default "horizontal". */
  orientation?: TabsOrientation;
  /** Only mount panels after they've been activated at least once. Default: false (all panels mount eagerly). */
  lazyMount?: boolean;
  /** Keep all panels mounted regardless of activation (useful with `lazyMount` overrides). Default: false. */
  forceMount?: boolean;
  /** Fires when the × on a closable tab is clicked. */
  onTabClose?: (value: string) => void;
  /** When true, the tab list scrolls horizontally with chevron buttons at the edges instead of wrapping. */
  scrollable?: boolean;
  /** When true, tabs can be reordered by dragging. Fires `onReorder` with the new value order. */
  sortable?: boolean;
  onReorder?: (values: string[]) => void;
  /** When true, the active tab is scrolled into view on activation. Default: true when `scrollable`. */
  scrollActiveIntoView?: boolean;
  /** Replace the default tab button content. The button shell (a11y, ref, key) stays owned by the component. */
  renderTab?: (ctx: TabsRenderTabContext) => ReactNode;
  /** Replace the default panel rendering. */
  renderPanel?: (ctx: TabsRenderPanelContext) => ReactNode;
  className?: string;
}

// Run layout effects on the client; fall back to a no-op effect on the server.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function useIndicator(
  tabListRef: React.RefObject<HTMLDivElement | null>,
  activeValue: string | undefined,
  orientation: TabsOrientation,
) {
  const [style, setStyle] = useState<CSSProperties>({});

  useIsoLayoutEffect(() => {
    if (!tabListRef.current || activeValue === undefined) return;

    const measure = () => {
      const list = tabListRef.current;
      if (!list) return;
      const activeTab = list.querySelector<HTMLElement>(
        `[aria-selected="true"]`,
      );
      if (!activeTab) return;

      const listRect = list.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();

      if (orientation === "vertical") {
        const y = tabRect.top - listRect.top;
        const h = tabRect.height;
        setStyle({
          ["--rtab-indicator-y" as string]: `${y}px`,
          ["--rtab-indicator-height" as string]: `${h}px`,
          ["--rtab-indicator-ready" as string]: "1",
        });
      } else {
        const x = tabRect.left - listRect.left;
        const w = tabRect.width;
        setStyle({
          ["--rtab-indicator-x" as string]: `${x}px`,
          ["--rtab-indicator-width" as string]: `${w}px`,
          ["--rtab-indicator-ready" as string]: "1",
        });
      }
    };

    measure();

    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(tabListRef.current);
    return () => ro.disconnect();
  }, [activeValue, tabListRef, orientation]);

  return style;
}

export const TabsStyled = forwardRef<HTMLDivElement, TabsStyledProps>(
  function TabsStyled(
    {
      tabs,
      variant = "line",
      size = "md",
      tone = "neutral",
      defaultValue,
      value,
      onChange,
      activation = "automatic",
      orientation = "horizontal",
      lazyMount = false,
      forceMount = false,
      onTabClose,
      scrollable = false,
      sortable = false,
      onReorder,
      scrollActiveIntoView,
      renderTab,
      renderPanel,
      className,
    },
    ref,
  ) {
    const autoScrollActive = scrollActiveIntoView ?? scrollable;
    const [scrollState, setScrollState] = useState<{ left: boolean; right: boolean }>({
      left: false,
      right: false,
    });
    const typeaheadBufferRef = useRef("");
    const typeaheadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dragValueRef = useRef<string | null>(null);
    const tabDefs = tabs.map((t) => ({ value: t.value, disabled: t.disabled }));

    const resolvedDefault =
      defaultValue ?? tabs.find((t) => !t.disabled)?.value;

    const { activeValue, getTabProps, getPanelProps } = useTabs({
      tabs: tabDefs,
      defaultValue: value === undefined ? resolvedDefault : undefined,
      value,
      onChange,
      activation,
      orientation,
    });

    const tabListRef = useRef<HTMLDivElement>(null);
    const indicatorStyle = useIndicator(tabListRef, activeValue, orientation);

    // Track which tabs have been activated for lazyMount.
    const activatedRef = useRef<Set<string>>(new Set());
    if (activeValue !== undefined) activatedRef.current.add(activeValue);

    const rootClass = ["rtab-root", className].filter(Boolean).join(" ");

    // Scroll-state: detect when there's content off the left/right edges so we can
    // toggle the chevron buttons. Only relevant when scrollable.
    useEffect(() => {
      if (!scrollable) return;
      const list = tabListRef.current;
      if (!list) return;
      const update = () => {
        setScrollState({
          left: list.scrollLeft > 4,
          right: list.scrollLeft + list.clientWidth < list.scrollWidth - 4,
        });
      };
      update();
      list.addEventListener("scroll", update, { passive: true });
      const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
      ro?.observe(list);
      return () => {
        list.removeEventListener("scroll", update);
        ro?.disconnect();
      };
    }, [scrollable, tabs.length]);

    // Auto-scroll active tab into view
    useEffect(() => {
      if (!autoScrollActive || !activeValue) return;
      const list = tabListRef.current;
      if (!list) return;
      const activeEl = list.querySelector<HTMLElement>(`[aria-selected="true"]`);
      if (!activeEl) return;
      activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }, [autoScrollActive, activeValue]);

    const scrollByAmount = (delta: number) => {
      tabListRef.current?.scrollBy({ left: delta, behavior: "smooth" });
    };

    // Typeahead: letters jump to the next tab whose label starts with the buffer.
    const handleTypeahead = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key.length !== 1 || e.altKey || e.ctrlKey || e.metaKey) return;
      typeaheadBufferRef.current = (typeaheadBufferRef.current + e.key).toLowerCase();
      if (typeaheadTimerRef.current) clearTimeout(typeaheadTimerRef.current);
      typeaheadTimerRef.current = setTimeout(() => { typeaheadBufferRef.current = ""; }, 600);

      const buffer = typeaheadBufferRef.current;
      const startIdx = Math.max(0, tabs.findIndex((t) => t.value === activeValue));
      // Search starting just after the active tab, wrapping around.
      for (let i = 1; i <= tabs.length; i++) {
        const idx = (startIdx + i) % tabs.length;
        const tab = tabs[idx];
        if (!tab || tab.disabled) continue;
        const labelStr = typeof tab.label === "string" ? tab.label : "";
        if (labelStr.toLowerCase().startsWith(buffer)) {
          // Use the existing tab button's click via aria-selected target.
          const list = tabListRef.current;
          const btn = list?.querySelector<HTMLButtonElement>(`[data-value="${tab.value}"]`);
          btn?.click();
          btn?.focus();
          break;
        }
      }
    };

    // Drag-to-reorder: HTML5 DnD is fine here — no external lib.
    const handleDragStart = (val: string) => (e: React.DragEvent<HTMLButtonElement>) => {
      if (!sortable) return;
      dragValueRef.current = val;
      e.dataTransfer.effectAllowed = "move";
    };
    const handleDragOver = (val: string) => (e: React.DragEvent<HTMLButtonElement>) => {
      if (!sortable || !dragValueRef.current || dragValueRef.current === val) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    };
    const handleDrop = (val: string) => (e: React.DragEvent<HTMLButtonElement>) => {
      if (!sortable) return;
      e.preventDefault();
      const from = dragValueRef.current;
      dragValueRef.current = null;
      if (!from || from === val || !onReorder) return;
      const order = tabs.map((t) => t.value);
      const fromIdx = order.indexOf(from);
      const toIdx = order.indexOf(val);
      if (fromIdx === -1 || toIdx === -1) return;
      const next = [...order];
      next.splice(fromIdx, 1);
      next.splice(toIdx, 0, from);
      onReorder(next);
    };

    return (
      <div
        ref={ref}
        className={rootClass}
        data-orientation={orientation}
        data-scrollable={scrollable || undefined}
        onKeyDown={handleTypeahead}
      >
        <div className="rtab-list-wrap">
          {scrollable && scrollState.left && (
            <button
              type="button"
              className="rtab-scroll-btn rtab-scroll-btn--left"
              aria-label="Scroll left"
              onClick={() => scrollByAmount(-200)}
            >
              <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7.5 3l-3 3 3 3"/></svg>
            </button>
          )}
          <div
            ref={tabListRef}
            role="tablist"
            aria-orientation={orientation}
            className="rtab-list"
            data-variant={variant}
            data-size={size}
            data-tone={tone}
            data-orientation={orientation}
            data-scrollable={scrollable || undefined}
            style={indicatorStyle}
          >
            {tabs.map((tab, index) => {
              const isActive = activeValue === tab.value;
              const isDisabled = !!tab.disabled;
              const tabProps = getTabProps(tab.value, { disabled: tab.disabled });
              return (
                <button
                  key={tab.value}
                  data-value={tab.value}
                  data-closable={tab.closable || undefined}
                  className="rtab-tab"
                  {...tabProps}
                  draggable={sortable && !isDisabled ? true : undefined}
                  onDragStart={sortable ? handleDragStart(tab.value) : undefined}
                  onDragOver={sortable ? handleDragOver(tab.value) : undefined}
                  onDrop={sortable ? handleDrop(tab.value) : undefined}
                >
                  {renderTab
                    ? renderTab({ tab, index, isActive, isDisabled })
                    : tab.label}
                  {tab.closable && (
                    <span
                      className="rtab-close"
                      role="button"
                      tabIndex={-1}
                      aria-label={`Close ${typeof tab.label === "string" ? tab.label : "tab"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTabClose?.(tab.value);
                      }}
                    >
                      <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                        <path d="M3 3l6 6M9 3l-6 6"/>
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
            {(variant === "line" || variant === "solid" || variant === "pill") && (
              <span className="rtab-indicator" aria-hidden="true" />
            )}
          </div>
          {scrollable && scrollState.right && (
            <button
              type="button"
              className="rtab-scroll-btn rtab-scroll-btn--right"
              aria-label="Scroll right"
              onClick={() => scrollByAmount(200)}
            >
              <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4.5 3l3 3-3 3"/></svg>
            </button>
          )}
        </div>
        <div className="rtab-panels">
          {tabs.map((tab) => {
            const isActive = activeValue === tab.value;
            const shouldRender =
              forceMount || !lazyMount || activatedRef.current.has(tab.value);
            return (
              <div
                key={tab.value}
                className="rtab-panel"
                {...getPanelProps(tab.value)}
              >
                {shouldRender
                  ? renderPanel
                    ? renderPanel({ tab, isActive })
                    : tab.content
                  : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);
