import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

interface CheckboxGroupContextValue {
  name?: string;
  groupDisabled: boolean;
  groupInvalid: boolean;
  values: string[];
  toggleValue: (value: string) => void;
}

const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);

export function useCheckboxGroupContext(): CheckboxGroupContextValue | null {
  return useContext(CheckboxGroupContext);
}

export interface CheckboxGroupProps {
  name?: string;
  value?: string[];
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  disabled?: boolean;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  invalid?: boolean;
  required?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export function CheckboxGroup({
  name,
  value: controlledValue,
  defaultValue = [],
  onChange,
  disabled = false,
  label,
  hint,
  error,
  invalid = false,
  required = false,
  className,
  style,
  children,
}: CheckboxGroupProps) {
  const legendId = useId();
  const hintId = useId();
  const errId = useId();

  const isControlled = controlledValue !== undefined;
  const [internal, setInternal] = useState<string[]>(defaultValue);
  const values = isControlled ? controlledValue! : internal;

  const effectiveInvalid = invalid || !!error;

  const toggleValue = useCallback(
    (val: string) => {
      const next = values.includes(val)
        ? values.filter((v) => v !== val)
        : [...values, val];
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [values, isControlled, onChange],
  );

  const ctx = useMemo<CheckboxGroupContextValue>(
    () => ({ name, groupDisabled: disabled, groupInvalid: effectiveInvalid, values, toggleValue }),
    [name, disabled, effectiveInvalid, values, toggleValue],
  );

  const ariaDescribedBy = [hint ? hintId : null, error ? errId : null]
    .filter(Boolean)
    .join(" ") || undefined;

  const rootClass = ["rchk-group", className].filter(Boolean).join(" ");

  return (
    <CheckboxGroupContext.Provider value={ctx}>
      <fieldset
        className={rootClass}
        style={style}
        disabled={disabled}
        aria-required={required || undefined}
        aria-invalid={effectiveInvalid || undefined}
        aria-describedby={ariaDescribedBy}
      >
        {label && (
          <legend id={legendId} className="rchk-group-legend">
            {label}
            {required && <span className="rchk-required" aria-hidden="true"> *</span>}
          </legend>
        )}
        {hint && (
          <span id={hintId} className="rchk-group-hint">
            {hint}
          </span>
        )}
        <div className="rchk-group-items">{children}</div>
        {error && (
          <span id={errId} className="rchk-error rchk-group-error" role="alert">
            {error}
          </span>
        )}
      </fieldset>
    </CheckboxGroupContext.Provider>
  );
}
