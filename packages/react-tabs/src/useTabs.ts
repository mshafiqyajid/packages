import {
  type AriaAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

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
  /** Called when the active tab changes. */
  onChange?: (value: string) => void;
}

export interface TabProps extends HTMLAttributes<HTMLButtonElement> {
  id: string;
  role: "tab";
  "aria-selected": boolean;
  "aria-controls": string;
  "aria-disabled"?: boolean;
  tabIndex: number;
}

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
  role: "tabpanel";
  "aria-labelledby": string;
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
  const { tabs = [], value: controlledValue, defaultValue, onChange } = opts;

  const listId = useStableId();
  const isControlled = controlledValue !== undefined;

  const [internalValue, setInternalValue] = useState<string | undefined>(
    defaultValue,
  );

  const activeValue = isControlled ? controlledValue : internalValue;

  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const setActiveValue = useCallback(
    (next: string) => {
      const tab = tabs.find((t) => t.value === next);
      if (tab?.disabled) return;
      if (isControlled) {
        if (next !== controlledValue) onChange?.(next);
      } else {
        if (next === internalValue) return;
        setInternalValue(next);
        onChange?.(next);
      }
    },
    [tabs, isControlled, controlledValue, internalValue, onChange],
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

        let nextValue: string | undefined;

        switch (event.key) {
          case "ArrowRight":
          case "ArrowDown": {
            const nextIndex = (currentIndex + 1) % enabled.length;
            nextValue = enabled[nextIndex]?.value;
            break;
          }
          case "ArrowLeft":
          case "ArrowUp": {
            const prevIndex =
              (currentIndex - 1 + enabled.length) % enabled.length;
            nextValue = enabled[prevIndex]?.value;
            break;
          }
          case "Home": {
            nextValue = enabled[0]?.value;
            break;
          }
          case "End": {
            nextValue = enabled[enabled.length - 1]?.value;
            break;
          }
          default:
            return;
        }

        if (nextValue === undefined || nextValue === currentValue) return;
        event.preventDefault();
        setActiveValue(nextValue);
        focusTab(nextValue);
      },
    [tabs, setActiveValue, focusTab],
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
          if (!isDisabled) setActiveValue(value);
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
      return {
        id: panelId(listId, value),
        role: "tabpanel",
        "aria-labelledby": tabId(listId, value),
        hidden: activeValue !== value,
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
