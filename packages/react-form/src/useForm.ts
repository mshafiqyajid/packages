import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
  type RefCallback,
} from "react";

export interface FormHelpers {
  reset: (values?: Record<string, unknown>) => void;
  setError: (name: string, message: string) => void;
  clearErrors: (name?: string) => void;
}

export interface FormState {
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
  touchedFields: Record<string, boolean>;
  dirtyFields: Record<string, boolean>;
}

export interface RegisterOptions {
  required?: boolean;
}

export interface RegisterResult {
  name: string;
  id: string;
  value: unknown;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  ref: RefCallback<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
  "aria-invalid": "true" | undefined;
  "aria-describedby": string | undefined;
  "aria-required": "true" | undefined;
}

export interface SetValueOptions {
  shouldDirty?: boolean;
  shouldValidate?: boolean;
}

export interface UseFormOptions {
  defaultValues?: Record<string, unknown>;
  values?: Record<string, unknown>;
  validate?: (
    values: Record<string, unknown>
  ) => Record<string, string> | Promise<Record<string, string>>;
  validateOn?: "blur" | "change" | "submit";
  revalidateOn?: "blur" | "change";
  onSubmit?: (values: Record<string, unknown>, helpers: FormHelpers) => void | Promise<void>;
  onError?: (errors: Record<string, string>) => void;
}

export interface UseFormResult {
  register: (name: string, options?: RegisterOptions) => RegisterResult;
  watch: (name?: string) => unknown;
  setValue: (name: string, value: unknown, options?: SetValueOptions) => void;
  setError: (name: string, message: string) => void;
  clearErrors: (name?: string) => void;
  reset: (values?: Record<string, unknown>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  formState: FormState;
}

function shallowEqual(
  a: Record<string, unknown>,
  b: Record<string, unknown>
): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

export function useForm(options: UseFormOptions = {}): UseFormResult {
  const {
    defaultValues = {},
    values: controlledValues,
    validate,
    validateOn = "submit",
    revalidateOn = "change",
    onSubmit,
    onError,
  } = options;

  const isControlled = controlledValues !== undefined;

  const defaultValuesRef = useRef<Record<string, unknown>>(defaultValues);
  const controlledValuesRef = useRef<Record<string, unknown> | undefined>(
    controlledValues
  );
  controlledValuesRef.current = controlledValues;

  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const [internalValues, setInternalValues] = useState<Record<string, unknown>>(
    () => ({ ...defaultValues })
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [dirtyFields, setDirtyFields] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fieldRefsMap = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>>({});

  const getValues = useCallback((): Record<string, unknown> => {
    return isControlled
      ? (controlledValuesRef.current ?? {})
      : internalValues;
  }, [isControlled, internalValues]);

  const getValuesRef = useRef(getValues);
  getValuesRef.current = getValues;

  const errorsRef = useRef(errors);
  errorsRef.current = errors;

  const runValidation = useCallback(
    async (
      vals: Record<string, unknown>
    ): Promise<Record<string, string>> => {
      if (!validate) return {};
      try {
        const result = await validate(vals);
        return result ?? {};
      } catch {
        return {};
      }
    },
    [validate]
  );

  const setErrorInternal = useCallback(
    (name: string, message: string) => {
      setErrors((prev) => ({ ...prev, [name]: message }));
    },
    []
  );

  const clearErrorsInternal = useCallback((name?: string) => {
    if (name === undefined) {
      setErrors({});
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }, []);

  const resetInternal = useCallback(
    (vals?: Record<string, unknown>) => {
      const nextValues = vals ?? { ...defaultValuesRef.current };
      if (!isControlled) {
        setInternalValues(nextValues);
      }
      setErrors({});
      setTouchedFields({});
      setDirtyFields({});
    },
    [isControlled]
  );

  const helpersRef = useRef<FormHelpers>({
    reset: resetInternal,
    setError: setErrorInternal,
    clearErrors: clearErrorsInternal,
  });
  helpersRef.current = {
    reset: resetInternal,
    setError: setErrorInternal,
    clearErrors: clearErrorsInternal,
  };

  const updateValue = useCallback(
    (name: string, value: unknown, opts?: SetValueOptions) => {
      if (!isControlled) {
        setInternalValues((prev) => ({ ...prev, [name]: value }));
      }

      if (opts?.shouldDirty !== false) {
        const defaultVal = defaultValuesRef.current[name];
        const isDirty = value !== defaultVal;
        setDirtyFields((prev) => {
          if (prev[name] === isDirty) return prev;
          return { ...prev, [name]: isDirty };
        });
      }

      if (opts?.shouldValidate && validateOn === "change") {
        const nextVals = isControlled
          ? (controlledValuesRef.current ?? {})
          : { ...getValuesRef.current(), [name]: value };
        runValidation(nextVals).then((newErrors) => {
          setErrors(newErrors);
        });
      }
    },
    [isControlled, validateOn, runValidation]
  );

  const register = useCallback(
    (name: string, regOptions?: RegisterOptions): RegisterResult => {
      const id = `rfrm-field-${name}`;
      const hintId = `${id}-hint`;
      const errorId = `${id}-error`;

      const currentValues = getValuesRef.current();
      const value = currentValues[name] ?? "";
      const hasError = Boolean(errorsRef.current[name]);

      const describedByParts: string[] = [];
      describedByParts.push(hintId);
      if (hasError) describedByParts.push(errorId);

      return {
        name,
        id,
        value,
        onChange: (
          e: ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          >
        ) => {
          const newValue =
            e.target.type === "checkbox"
              ? (e.target as HTMLInputElement).checked
              : e.target.value;

          updateValue(name, newValue);

          if (validateOn === "change") {
            const nextVals = isControlled
              ? (controlledValuesRef.current ?? {})
              : { ...getValuesRef.current(), [name]: newValue };
            runValidation(nextVals).then((newErrors) => {
              setErrors(newErrors);
            });
          } else if (revalidateOn === "change" && errorsRef.current[name]) {
            const nextVals = isControlled
              ? (controlledValuesRef.current ?? {})
              : { ...getValuesRef.current(), [name]: newValue };
            runValidation(nextVals).then((newErrors) => {
              setErrors(newErrors);
            });
          }
        },
        onBlur: (
          _e: FocusEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          >
        ) => {
          setTouchedFields((prev) => {
            if (prev[name]) return prev;
            return { ...prev, [name]: true };
          });

          if (validateOn === "blur") {
            const vals = getValuesRef.current();
            runValidation(vals).then((newErrors) => {
              setErrors(newErrors);
            });
          } else if (revalidateOn === "blur" && errorsRef.current[name]) {
            const vals = getValuesRef.current();
            runValidation(vals).then((newErrors) => {
              setErrors(newErrors);
            });
          }
        },
        ref: (
          el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
        ) => {
          fieldRefsMap.current[name] = el;
        },
        "aria-invalid": hasError ? "true" : undefined,
        "aria-describedby": describedByParts.join(" ") || undefined,
        "aria-required": regOptions?.required ? "true" : undefined,
      };
    },
    [getValuesRef, isControlled, validateOn, revalidateOn, runValidation, updateValue]
  );

  const watch = useCallback(
    (name?: string): unknown => {
      const vals = getValues();
      if (name === undefined) return vals;
      return vals[name];
    },
    [getValues]
  );

  const setValue = useCallback(
    (name: string, value: unknown, opts?: SetValueOptions) => {
      updateValue(name, value, opts);
    },
    [updateValue]
  );

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const vals = getValuesRef.current();

      const proceed = async () => {
        setIsSubmitting(true);

        const validationErrors = await runValidation(vals);

        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          setIsSubmitting(false);
          onErrorRef.current?.(validationErrors);
          return;
        }

        setErrors({});

        try {
          await onSubmitRef.current?.(vals, helpersRef.current);
        } finally {
          setIsSubmitting(false);
        }
      };

      proceed();
    },
    [runValidation]
  );

  const currentValues = getValues();
  const isValid = Object.keys(errors).length === 0;
  const isDirty = !shallowEqual(currentValues, defaultValuesRef.current);

  const formState: FormState = {
    isSubmitting,
    isValid,
    isDirty,
    errors,
    touchedFields,
    dirtyFields,
  };

  return {
    register,
    watch,
    setValue,
    setError: setErrorInternal,
    clearErrors: clearErrorsInternal,
    reset: resetInternal,
    handleSubmit,
    formState,
  };
}
