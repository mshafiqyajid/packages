import { useState, useCallback, useRef } from "react";

export interface UsePaginationOptions {
  page?: number;
  defaultPage?: number;
  onChange?: (page: number) => void;
  total: number;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  siblings?: number;
  boundaries?: number;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
}

export interface UsePaginationResult {
  page: number;
  setPage: (page: number) => void;
  pages: (number | "...")[];
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
  prev: () => void;
  next: () => void;
  getPageProps: (p: number) => {
    "aria-label": string;
    "aria-current": "page" | undefined;
    "data-active": "true" | undefined;
    onClick: () => void;
  };
  prevProps: { onClick: () => void; "aria-disabled": boolean; "aria-label": string };
  nextProps: { onClick: () => void; "aria-disabled": boolean; "aria-label": string };
  firstProps: { onClick: () => void; "aria-disabled": boolean; "aria-label": string };
  lastProps: { onClick: () => void; "aria-disabled": boolean; "aria-label": string };
}

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function computePages(
  page: number,
  totalPages: number,
  siblings: number,
  boundaries: number,
): (number | "...")[] {
  if (totalPages <= 1) return [1];
  if (totalPages <= 2 * boundaries + 2 * siblings + 3) {
    return range(1, totalPages);
  }

  const leftSiblingIndex = Math.max(page - siblings, boundaries + 1);
  const rightSiblingIndex = Math.min(page + siblings, totalPages - boundaries);
  const showLeftEllipsis = leftSiblingIndex > boundaries + 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - boundaries - 1;

  const result: (number | "...")[] = [...range(1, boundaries)];

  if (showLeftEllipsis) {
    result.push("...");
  } else {
    result.push(...range(boundaries + 1, leftSiblingIndex - 1));
  }

  result.push(...range(leftSiblingIndex, rightSiblingIndex));

  if (showRightEllipsis) {
    result.push("...");
  } else {
    result.push(...range(rightSiblingIndex + 1, totalPages - boundaries));
  }

  result.push(...range(totalPages - boundaries + 1, totalPages));

  return result;
}

export function usePagination({
  page: controlledPage,
  defaultPage = 1,
  onChange,
  total,
  pageSize = 10,
  siblings = 1,
  boundaries = 1,
}: UsePaginationOptions): UsePaginationResult {
  const isControlled = controlledPage !== undefined;
  const [internalPage, setInternalPage] = useState(defaultPage);

  const page = isControlled ? (controlledPage as number) : internalPage;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const setPage = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(1, next), totalPages);
      if (!isControlled) setInternalPage(clamped);
      onChangeRef.current?.(clamped);
    },
    [isControlled, totalPages],
  );

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const prev = useCallback(() => {
    if (hasPrev) setPage(page - 1);
  }, [hasPrev, page, setPage]);

  const next = useCallback(() => {
    if (hasNext) setPage(page + 1);
  }, [hasNext, page, setPage]);

  const pages = computePages(page, totalPages, siblings, boundaries);

  const getPageProps = useCallback(
    (p: number) => ({
      "aria-label": `Page ${p}`,
      "aria-current": p === page ? ("page" as const) : undefined,
      "data-active": p === page ? ("true" as const) : undefined,
      onClick: () => setPage(p),
    }),
    [page, setPage],
  );

  const prevProps = {
    onClick: prev,
    "aria-disabled": !hasPrev,
    "aria-label": "Go to previous page",
  };

  const nextProps = {
    onClick: next,
    "aria-disabled": !hasNext,
    "aria-label": "Go to next page",
  };

  const firstProps = {
    onClick: () => setPage(1),
    "aria-disabled": page === 1,
    "aria-label": "Go to first page",
  };

  const lastProps = {
    onClick: () => setPage(totalPages),
    "aria-disabled": page === totalPages,
    "aria-label": "Go to last page",
  };

  return {
    page,
    setPage,
    pages,
    totalPages,
    hasPrev,
    hasNext,
    prev,
    next,
    getPageProps,
    prevProps,
    nextProps,
    firstProps,
    lastProps,
  };
}
