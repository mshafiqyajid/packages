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
      renderTab,
      renderPanel,
      className,
    },
    ref,
  ) {
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

    return (
      <div
        ref={ref}
        className={rootClass}
        data-orientation={orientation}
      >
        <div
          ref={tabListRef}
          role="tablist"
          aria-orientation={orientation}
          className="rtab-list"
          data-variant={variant}
          data-size={size}
          data-tone={tone}
          data-orientation={orientation}
          style={indicatorStyle}
        >
          {tabs.map((tab, index) => {
            const isActive = activeValue === tab.value;
            const isDisabled = !!tab.disabled;
            return (
              <button
                key={tab.value}
                className="rtab-tab"
                {...getTabProps(tab.value, { disabled: tab.disabled })}
              >
                {renderTab
                  ? renderTab({ tab, index, isActive, isDisabled })
                  : tab.label}
              </button>
            );
          })}
          {(variant === "line" || variant === "solid" || variant === "pill") && (
            <span className="rtab-indicator" aria-hidden="true" />
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
