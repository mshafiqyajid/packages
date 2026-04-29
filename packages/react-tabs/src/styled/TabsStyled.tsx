import {
  type CSSProperties,
  type ReactNode,
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useTabs } from "../useTabs";

export type TabsVariant = "line" | "solid" | "pill";
export type TabsSize = "sm" | "md" | "lg";
export type TabsTone = "neutral" | "primary";

export interface TabItem {
  value: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsStyledProps {
  tabs: TabItem[];
  variant?: TabsVariant;
  size?: TabsSize;
  tone?: TabsTone;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

// Run layout effects on the client; fall back to a no-op effect on the server.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function useIndicator(
  tabListRef: React.RefObject<HTMLDivElement | null>,
  activeValue: string | undefined,
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
      const x = tabRect.left - listRect.left;
      const w = tabRect.width;

      setStyle({
        ["--rtab-indicator-x" as string]: `${x}px`,
        ["--rtab-indicator-width" as string]: `${w}px`,
        ["--rtab-indicator-ready" as string]: "1",
      });
    };

    measure();

    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(tabListRef.current);
    return () => ro.disconnect();
  }, [activeValue, tabListRef]);

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
    });

    const tabListRef = useRef<HTMLDivElement>(null);
    const indicatorStyle = useIndicator(tabListRef, activeValue);

    const rootClass = ["rtab-root", className].filter(Boolean).join(" ");

    return (
      <div ref={ref} className={rootClass}>
        <div
          ref={tabListRef}
          role="tablist"
          className="rtab-list"
          data-variant={variant}
          data-size={size}
          data-tone={tone}
          style={indicatorStyle}
        >
          {tabs.map((tab) => (
            <button
              key={tab.value}
              className="rtab-tab"
              {...getTabProps(tab.value, { disabled: tab.disabled })}
            >
              {tab.label}
            </button>
          ))}
          {(variant === "line" || variant === "solid" || variant === "pill") && (
            <span className="rtab-indicator" aria-hidden="true" />
          )}
        </div>
        <div className="rtab-panels">
          {tabs.map((tab) => (
            <div
              key={tab.value}
              className="rtab-panel"
              {...getPanelProps(tab.value)}
            >
              {tab.content}
            </div>
          ))}
        </div>
      </div>
    );
  },
);
