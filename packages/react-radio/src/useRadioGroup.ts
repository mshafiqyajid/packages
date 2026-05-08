import { useState, useCallback, useId } from "react";

export interface UseRadioGroupOptions {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
}

export interface UseRadioGroupResult {
  groupProps: {
    role: "radiogroup";
    "aria-required": boolean | undefined;
    "aria-invalid": boolean | undefined;
    "aria-describedby": string | undefined;
  };
  getItemProps: (
    itemValue: string,
    itemDisabled?: boolean,
  ) => {
    role: "radio";
    "aria-checked": boolean;
    "aria-disabled": boolean | undefined;
    tabIndex: number;
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    "data-checked": string | undefined;
    "data-disabled": string | undefined;
    "data-focused": string | undefined;
  };
  value: string | undefined;
  setValue: (v: string) => void;
  name: string;
  groupId: string;
}

export function useRadioGroup(options: UseRadioGroupOptions = {}): UseRadioGroupResult {
  const {
    value: controlledValue,
    defaultValue,
    onChange,
    name: nameProp,
    disabled = false,
    required = false,
    invalid = false,
  } = options;

  const generatedId = useId();
  const generatedName = useId();
  const groupId = generatedId;
  const name = nameProp ?? generatedName;

  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);

  const value = isControlled ? controlledValue : internalValue;

  const setValue = useCallback(
    (v: string) => {
      if (!isControlled) {
        setInternalValue(v);
      }
      onChange?.(v);
    },
    [isControlled, onChange],
  );

  const groupProps = {
    role: "radiogroup" as const,
    "aria-required": required || undefined,
    "aria-invalid": invalid || undefined,
    "aria-describedby": undefined as string | undefined,
  };

  const getItemProps = useCallback(
    (itemValue: string, itemDisabled?: boolean) => {
      const isDisabled = disabled || (itemDisabled ?? false);
      const isChecked = value === itemValue;

      const handleClick = () => {
        if (isDisabled) return;
        setValue(itemValue);
      };

      const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === " ") {
          e.preventDefault();
          if (!isDisabled) {
            setValue(itemValue);
          }
          return;
        }

        if (
          e.key === "ArrowDown" ||
          e.key === "ArrowRight" ||
          e.key === "ArrowUp" ||
          e.key === "ArrowLeft"
        ) {
          e.preventDefault();
          const target = e.currentTarget as HTMLElement;
          const group = target.closest("[role='radiogroup']");
          if (!group) return;

          const items = Array.from(
            group.querySelectorAll<HTMLElement>("[role='radio']:not([aria-disabled='true'])"),
          );
          if (items.length === 0) return;

          const currentIndex = items.indexOf(target);
          const isForward = e.key === "ArrowDown" || e.key === "ArrowRight";
          let nextIndex: number;

          if (currentIndex === -1) {
            nextIndex = isForward ? 0 : items.length - 1;
          } else {
            nextIndex = isForward
              ? (currentIndex + 1) % items.length
              : (currentIndex - 1 + items.length) % items.length;
          }

          items[nextIndex]?.focus();
          items[nextIndex]?.click();
        }
      };

      return {
        role: "radio" as const,
        "aria-checked": isChecked,
        "aria-disabled": isDisabled || undefined,
        tabIndex: isChecked ? 0 : value === undefined && itemValue === itemValue ? -1 : -1,
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        "data-checked": isChecked ? "true" : undefined,
        "data-disabled": isDisabled ? "true" : undefined,
        "data-focused": undefined as string | undefined,
      };
    },
    [value, disabled, setValue],
  );

  return {
    groupProps,
    getItemProps,
    value,
    setValue,
    name,
    groupId,
  };
}
