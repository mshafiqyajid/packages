import { useMemo } from "react";

export type BreakpointMap = { [breakpoint: string]: number };

export interface UseMasonryOptions {
  columns?: number | BreakpointMap;
  spacing?: number | string;
}

export interface MasonryContainerProps {
  role: "list";
  style: React.CSSProperties;
  "data-columns": number;
}

export interface MasonryItemProps {
  role: "listitem";
  className: string;
}

export interface UseMasonryResult {
  containerProps: MasonryContainerProps;
  getItemProps: () => MasonryItemProps;
  activeColumns: number;
}

function resolveColumns(
  columns: number | BreakpointMap | undefined,
  windowWidth: number
): number {
  if (columns === undefined) return 3;
  if (typeof columns === "number") return columns;

  const entries = Object.entries(columns)
    .map(([key, val]) => ({ bp: key === "default" ? 0 : Number(key), val }))
    .sort((a, b) => a.bp - b.bp);

  let active = entries[0]?.val ?? 3;
  for (const { bp, val } of entries) {
    if (windowWidth >= bp) active = val;
  }
  return active;
}

function resolveSpacing(spacing: number | string | undefined): string {
  if (spacing === undefined) return "16px";
  if (typeof spacing === "number") return `${spacing}px`;
  return spacing;
}

export function useMasonry(
  options: UseMasonryOptions = {},
  windowWidth = 1024
): UseMasonryResult {
  const { columns, spacing } = options;

  const activeColumns = useMemo(
    () => resolveColumns(columns, windowWidth),
    [columns, windowWidth]
  );

  const gapValue = useMemo(() => resolveSpacing(spacing), [spacing]);

  const containerProps: MasonryContainerProps = useMemo(
    () => ({
      role: "list",
      style: {
        "--rmsn-columns": String(activeColumns),
        "--rmsn-gap": gapValue,
      } as React.CSSProperties,
      "data-columns": activeColumns,
    }),
    [activeColumns, gapValue]
  );

  const getItemProps = useMemo(
    (): (() => MasonryItemProps) =>
      () => ({
        role: "listitem",
        className: "rmsn-item",
      }),
    []
  );

  return { containerProps, getItemProps, activeColumns };
}
