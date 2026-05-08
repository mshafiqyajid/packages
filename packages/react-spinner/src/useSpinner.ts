export interface UseSpinnerOptions {
  label?: string;
}

export interface UseSpinnerResult {
  spinnerProps: {
    role: "status";
    "aria-label": string;
    "aria-live": "polite";
  };
}

export function useSpinner({
  label = "Loading",
}: UseSpinnerOptions = {}): UseSpinnerResult {
  return {
    spinnerProps: {
      role: "status",
      "aria-label": label,
      "aria-live": "polite",
    },
  };
}
