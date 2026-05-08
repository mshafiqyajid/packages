import { useCallback, useState, type KeyboardEvent, type MouseEvent } from "react";

export interface UseChipOptions {
  selectable?: boolean;
  selected?: boolean;
  defaultSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  dismissible?: boolean;
  onDismiss?: () => void;
  disabled?: boolean;
}

export interface UseChipResult {
  chipProps: {
    role?: "option" | "button";
    "aria-selected"?: boolean;
    "aria-disabled"?: boolean;
    tabIndex?: number;
    onClick?: () => void;
    onKeyDown?: (e: KeyboardEvent) => void;
  };
  dismissProps: {
    "aria-label": "Remove";
    type: "button";
    onClick: (e: MouseEvent) => void;
  };
  isSelected: boolean;
  isDismissed: boolean;
  select: (v?: boolean) => void;
  dismiss: () => void;
}

export function useChip(options: UseChipOptions = {}): UseChipResult {
  const {
    selectable = false,
    selected,
    defaultSelected = false,
    onSelect,
    dismissible = false,
    onDismiss,
    disabled = false,
  } = options;

  const isControlled = selected !== undefined;
  const [internalSelected, setInternalSelected] = useState(defaultSelected);
  const [isDismissed, setIsDismissed] = useState(false);

  const isSelected = isControlled ? (selected as boolean) : internalSelected;

  const select = useCallback(
    (v?: boolean) => {
      if (disabled) return;
      const next = v !== undefined ? v : !isSelected;
      if (!isControlled) {
        setInternalSelected(next);
      }
      onSelect?.(next);
    },
    [disabled, isSelected, isControlled, onSelect],
  );

  const dismiss = useCallback(() => {
    setIsDismissed(true);
    onDismiss?.();
  }, [onDismiss]);

  const handleClick = useCallback(() => {
    if (disabled) return;
    if (selectable) {
      select();
    }
  }, [disabled, selectable, select]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;
      if (selectable && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        select();
      }
    },
    [disabled, selectable, select],
  );

  const handleDismissClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      dismiss();
    },
    [dismiss],
  );

  const chipProps: UseChipResult["chipProps"] = {};

  if (selectable) {
    chipProps.role = "option";
    chipProps["aria-selected"] = isSelected;
    chipProps.tabIndex = disabled ? -1 : 0;
    chipProps.onClick = handleClick;
    chipProps.onKeyDown = handleKeyDown;
  } else if (dismissible) {
    chipProps.role = "button";
    chipProps.tabIndex = disabled ? -1 : 0;
  }

  if (disabled) {
    chipProps["aria-disabled"] = true;
  }

  return {
    chipProps,
    dismissProps: {
      "aria-label": "Remove",
      type: "button",
      onClick: handleDismissClick,
    },
    isSelected,
    isDismissed,
    select,
    dismiss,
  };
}
