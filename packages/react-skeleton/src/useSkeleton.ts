export interface UseSkeletonOptions {
  label?: string;
}

export interface UseSkeletonResult {
  skeletonProps: {
    role: "status";
    "aria-label": string;
    "aria-busy": "true";
    "aria-live": "polite";
  };
}

export function useSkeleton({
  label = "Loading",
}: UseSkeletonOptions = {}): UseSkeletonResult {
  return {
    skeletonProps: {
      role: "status",
      "aria-label": label,
      "aria-busy": "true",
      "aria-live": "polite",
    },
  };
}
