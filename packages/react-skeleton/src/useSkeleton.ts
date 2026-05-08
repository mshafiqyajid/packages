export interface UseSkeletonOptions {
  label?: string;
  count?: number;
  spacing?: number;
  inline?: boolean;
  baseColor?: string;
  highlightColor?: string;
  borderRadius?: string | number;
  enableAnimation?: boolean;
  fitContent?: boolean;
}

export interface UseSkeletonResult {
  skeletonProps: {
    role: "status";
    "aria-label": string;
    "aria-busy": "true";
    "aria-live": "polite";
  };
  count: number;
  spacing: number;
  inline: boolean;
  baseColor: string | undefined;
  highlightColor: string | undefined;
  borderRadius: string | number | undefined;
  enableAnimation: boolean;
  fitContent: boolean;
}

export function useSkeleton({
  label = "Loading",
  count = 1,
  spacing = 8,
  inline = false,
  baseColor,
  highlightColor,
  borderRadius,
  enableAnimation = true,
  fitContent = false,
}: UseSkeletonOptions = {}): UseSkeletonResult {
  return {
    skeletonProps: {
      role: "status",
      "aria-label": label,
      "aria-busy": "true",
      "aria-live": "polite",
    },
    count,
    spacing,
    inline,
    baseColor,
    highlightColor,
    borderRadius,
    enableAnimation,
    fitContent,
  };
}
