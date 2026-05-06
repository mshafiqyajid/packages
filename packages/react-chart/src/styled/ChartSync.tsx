import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Shared crosshair context — when a group of charts is wrapped in
 * `<ChartSyncProvider>`, hovering one chart's plot area broadcasts the active
 * x-label so siblings can render their own crosshair at the matching index.
 *
 * Charts opt in via the `syncId` prop. Charts that don't pass `syncId` ignore
 * the context.
 */
export interface ChartSyncState {
  cursorByGroup: Record<string, string | null>;
  setCursor: (groupId: string, label: string | null) => void;
}

const ChartSyncContext = createContext<ChartSyncState | null>(null);

export function ChartSyncProvider({ children }: { children: ReactNode }) {
  const [cursorByGroup, setCursorByGroup] = useState<Record<string, string | null>>({});

  const setCursor = useCallback((groupId: string, label: string | null) => {
    setCursorByGroup((prev) =>
      prev[groupId] === label ? prev : { ...prev, [groupId]: label },
    );
  }, []);

  const value = useMemo<ChartSyncState>(
    () => ({ cursorByGroup, setCursor }),
    [cursorByGroup, setCursor],
  );

  return <ChartSyncContext.Provider value={value}>{children}</ChartSyncContext.Provider>;
}

/** Read the synchronized cursor for a given group id. */
export function useChartSyncCursor(groupId: string | undefined): {
  label: string | null;
  setLabel: (label: string | null) => void;
} {
  const ctx = useContext(ChartSyncContext);
  if (!ctx || !groupId) {
    return { label: null, setLabel: () => {} };
  }
  return {
    label: ctx.cursorByGroup[groupId] ?? null,
    setLabel: (label) => ctx.setCursor(groupId, label),
  };
}
