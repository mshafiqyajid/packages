import {
  type HTMLAttributes,
  type KeyboardEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

export type TabsActivation = "automatic" | "manual";
export type TabsOrientation = "horizontal" | "vertical";
export type TabsChangeReason = "click" | "keyboard" | "programmatic";

export interface UseTabsTab {
  value: string;
  disabled?: boolean;
}

export interface UseTabsOptions {
  /** Tab definitions — needed for keyboard navigation between tabs. */
  tabs?: UseTabsTab[];
  /** Controlled active value. */
  value?: string;
  /** Initial active value when uncontrolled. */
  defaultValue?: string;
  /** Called when the active tab changes. Optional second arg reports the trigger reason. */
  onChange?: (value: string, reason: TabsChangeReason) => void;
  /** "automatic" (default) — arrow keys move focus AND activate. "manual" — arrows move focus only; Enter/Space activates. */
  activation?: TabsActivation;
  /** Affects keyboard nav. Default "horizontal". */
  orientation?: TabsOrientation;
}

export interface TabProps extends HTMLAttributes<HTMLButtonElement> {
  id: string;
  role: "tab";
  "aria-selected": boolean;
  "aria-controls": string;
  "aria-disabled"?: boolean;
  "data-state": "active" | "inactive";
  tabIndex: number;
}

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
  role: "tabpanel";
  "aria-labelledby": string;
  "data-state": "active" | "inactive";
  hidden: boolean;
}

export interface UseTabsResult {
  /** Currently active tab value. */
  activeValue: string | undefined;
  /** Returns props to spread onto a tab trigger `<button>`. */
  getTabProps: (value: string, options?: { disabled?: boolean }) => TabProps;
  /** Returns props to spread onto a tab panel. */
  getPanelProps: (value: string) => PanelProps;
  /** Programmatically set the active tab. */
  setActiveValue: (value: string) => void;
}

const tabId = (listId: string, value: string) => `${listId}-tab-${value}`;
const panelId = (listId: string, value: string) => `${listId}-panel-${value}`;

let counter = 0;
function useStableId() {
  const ref = useRef<string | null>(null);
  if (ref.current === null) {
    ref.current = `rtabs-${++counter}`;
  }
  return ref.current;
}

export function useTabs(opts: UseTabsOptions = {}): UseTabsResult {
  const {
    tabs = [],
    value: controlledValue,
    defaultValue,
    onChange,
    activation = "automatic",
    orientation = "horizontal",
  } = opts;

  const listId = useStableId();
  const isControlled = controlledValue !== undefined;

  const [internalValue, setInternalValue] = useState<string | undefined>(
    defaultValue,
  );

  const activeValue = isControlled ? controlledValue : internalValue;

  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const setActiveValue = useCallback(
    (next: string, reason: TabsChangeReason = "programmatic") => {
      const tab = tabs.find((t) => t.value === next);
      if (tab?.disabled) return;
      if (isControlled) {
        if (next !== controlledValue) onChangeRef.current?.(next, reason);
      } else {
        if (next === internalValue) return;
        setInternalValue(next);
        onChangeRef.current?.(next, reason);
      }
    },
    [tabs, isControlled, controlledValue, internalValue],
  );

  const focusTab = useCallback((value: string) => {
    tabRefs.current.get(value)?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (currentValue: string) =>
      (event: KeyboardEvent<HTMLButtonElement>) => {
        const enabled = tabs.filter((t) => !t.disabled);
        if (enabled.length === 0) return;

        const currentIndex = enabled.findIndex((t) => t.value === currentValue);

        const isForward =
          orientation === "vertical"
            ? event.key === "ArrowDown"
            : event.key === "ArrowRight";
        const isBackward =
          orientation === "vertical"
            ? event.key === "ArrowUp"
            : event.key === "ArrowLeft";

        let nextValue: string | undefined;

        if (isForward) {
          const nextIndex = (currentIndex + 1) % enabled.length;
          nextValue = enabled[nextIndex]?.value;
        } else if (isBackward) {
          const prevIndex = (currentIndex - 1 + enabled.length) % enabled.length;
          nextValue = enabled[prevIndex]?.value;
        } else if (event.key === "Home") {
          nextValue = enabled[0]?.value;
        } else if (event.key === "End") {
          nextValue = enabled[enabled.length - 1]?.value;
        } else if (
          activation === "manual" &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          setActiveValue(currentValue, "keyboard");
          return;
        } else {
          return;
        }

        if (nextValue === undefined || nextValue === currentValue) return;
        event.preventDefault();
        focusTab(nextValue);
        if (activation === "automatic") {
          setActiveValue(nextValue, "keyboard");
        }
      },
    [tabs, orientation, activation, setActiveValue, focusTab],
  );

  const getTabProps = useCallback(
    (value: string, options?: { disabled?: boolean }): TabProps => {
      const isDisabled =
        options?.disabled ?? tabs.find((t) => t.value === value)?.disabled;
      const isSelected = activeValue === value;
      return {
        id: tabId(listId, value),
        role: "tab",
        "aria-selected": isSelected,
        "aria-controls": panelId(listId, value),
        "aria-disabled": isDisabled || undefined,
        "data-state": isSelected ? "active" : "inactive",
        tabIndex: isSelected ? 0 : -1,
        disabled: isDisabled,
        ref: (node: HTMLButtonElement | null) => {
          if (node) {
            tabRefs.current.set(value, node);
          } else {
            tabRefs.current.delete(value);
          }
        },
        onClick: () => {
          if (!isDisabled) setActiveValue(value, "click");
        },
        onKeyDown: handleKeyDown(value),
      } as TabProps & {
        disabled: boolean | undefined;
        ref: (node: HTMLButtonElement | null) => void;
      };
    },
    [activeValue, listId, tabs, setActiveValue, handleKeyDown],
  );

  const getPanelProps = useCallback(
    (value: string): PanelProps => {
      const isActive = activeValue === value;
      return {
        id: panelId(listId, value),
        role: "tabpanel",
        "aria-labelledby": tabId(listId, value),
        "data-state": isActive ? "active" : "inactive",
        hidden: !isActive,
        tabIndex: 0,
      };
    },
    [activeValue, listId],
  );

  return useMemo(
    () => ({ activeValue, getTabProps, getPanelProps, setActiveValue }),
    [activeValue, getTabProps, getPanelProps, setActiveValue],
  );
}
