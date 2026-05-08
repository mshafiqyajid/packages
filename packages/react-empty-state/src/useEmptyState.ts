export type EmptyStatePreset = "no-data" | "no-results" | "error" | "offline" | "empty-search";

export interface UseEmptyStateOptions {
  title?: string;
}

export interface UseEmptyStateResult {
  rootProps: {
    role: "status";
    "aria-label": string | undefined;
  };
}

export function useEmptyState(options: UseEmptyStateOptions = {}): UseEmptyStateResult {
  return {
    rootProps: {
      role: "status",
      "aria-label": options.title,
    },
  };
}
