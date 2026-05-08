export interface UseDividerOptions {
  orientation?: "horizontal" | "vertical";
}

export interface UseDividerResult {
  dividerProps: {
    role: "separator";
    "aria-orientation": "horizontal" | "vertical";
  };
}

export function useDivider(options: UseDividerOptions = {}): UseDividerResult {
  const { orientation = "horizontal" } = options;
  return {
    dividerProps: {
      role: "separator",
      "aria-orientation": orientation,
    },
  };
}
