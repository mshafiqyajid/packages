import { useState, useCallback } from "react";

export interface UseCardOptions {
  clickable?: boolean;
  selected?: boolean;
  defaultSelected?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onSelect?: (selected: boolean) => void;
}

export interface UseCardResult {
  cardProps: {
    role?: "button" | "article";
    tabIndex?: number;
    "aria-disabled"?: boolean;
    "aria-pressed"?: boolean;
    onClick?: (e: React.MouseEvent) => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    onFocus?: (e: React.FocusEvent) => void;
    onBlur?: (e: React.FocusEvent) => void;
  };
  isSelected: boolean;
  isFocused: boolean;
}

export function useCard(options: UseCardOptions = {}): UseCardResult {
  const {
    clickable,
    selected,
    defaultSelected = false,
    disabled,
    onClick,
    onSelect,
  } = options;

  const isControlled = selected !== undefined;
  const [internalSelected, setInternalSelected] = useState(defaultSelected);
  const [isFocused, setIsFocused] = useState(false);

  const isSelected = isControlled ? selected! : internalSelected;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      if (!isControlled) {
        const next = !internalSelected;
        setInternalSelected(next);
        onSelect?.(next);
      } else {
        onSelect?.(!selected);
      }
      onClick?.(e);
    },
    [disabled, isControlled, internalSelected, selected, onClick, onSelect]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!isControlled) {
          const next = !internalSelected;
          setInternalSelected(next);
          onSelect?.(next);
        } else {
          onSelect?.(!selected);
        }
        onClick?.(e as unknown as React.MouseEvent);
      }
    },
    [disabled, isControlled, internalSelected, selected, onClick, onSelect]
  );

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  if (!clickable) {
    return {
      cardProps: { role: "article" },
      isSelected,
      isFocused,
    };
  }

  return {
    cardProps: {
      role: "button",
      tabIndex: disabled ? -1 : 0,
      "aria-disabled": disabled || undefined,
      "aria-pressed": isSelected,
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      onFocus: handleFocus,
      onBlur: handleBlur,
    },
    isSelected,
    isFocused,
  };
}
