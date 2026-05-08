import { useState, useCallback } from "react";
import type { ReactNode } from "react";

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
}

export interface UseBreadcrumbOptions {
  items: BreadcrumbItem[];
  maxItems?: number;
  expandLabel?: string;
}

export interface VisibleItem {
  item: BreadcrumbItem;
  originalIndex: number;
  isEllipsis?: boolean;
}

export interface UseBreadcrumbResult {
  navProps: { role: "navigation"; "aria-label": "Breadcrumb" };
  listProps: { className?: string };
  getItemProps: (index: number) => {
    "aria-current": "page" | undefined;
    isLast: boolean;
    item: BreadcrumbItem;
  };
  visibleItems: VisibleItem[];
  isCollapsed: boolean;
  expand: () => void;
}

export function useBreadcrumb({
  items,
  maxItems,
  expandLabel = "Show collapsed items",
}: UseBreadcrumbOptions): UseBreadcrumbResult {
  const [isCollapsed, setIsCollapsed] = useState(
    maxItems !== undefined && items.length > maxItems,
  );

  const expand = useCallback(() => {
    setIsCollapsed(false);
  }, []);

  const navProps = {
    role: "navigation" as const,
    "aria-label": "Breadcrumb" as const,
  };

  const listProps = {};

  const getItemProps = useCallback(
    (index: number) => {
      const isLast = index === items.length - 1;
      return {
        "aria-current": isLast ? ("page" as const) : undefined,
        isLast,
        item: items[index] as BreadcrumbItem,
      };
    },
    [items],
  );

  let visibleItems: VisibleItem[];

  if (isCollapsed && maxItems !== undefined && items.length > maxItems) {
    const ellipsisItem: BreadcrumbItem = {
      label: expandLabel,
      onClick: expand,
    };
    visibleItems = [
      { item: items[0] as BreadcrumbItem, originalIndex: 0 },
      { item: ellipsisItem, originalIndex: -1, isEllipsis: true },
      {
        item: items[items.length - 1] as BreadcrumbItem,
        originalIndex: items.length - 1,
      },
    ];
  } else {
    visibleItems = items.map((item, index) => ({ item, originalIndex: index }));
  }

  return {
    navProps,
    listProps,
    getItemProps,
    visibleItems,
    isCollapsed,
    expand,
  };
}
