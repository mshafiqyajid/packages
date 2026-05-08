import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import { useForm, type UseFormOptions, type UseFormResult } from "../useForm";

// ---------------------------------------------------------------------------
// Context — shared between Form and its sub-components
// ---------------------------------------------------------------------------

interface FormContextValue {
  form: UseFormResult;
}

const FormContext = createContext<FormContextValue | null>(null);

function useFormContext(componentName: string): FormContextValue {
  const ctx = useContext(FormContext);
  if (!ctx) {
    throw new Error(
      `<Form.${componentName}> must be rendered inside <FormStyled>`
    );
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// FormStyled props
// ---------------------------------------------------------------------------

export interface FormStyledProps extends UseFormOptions {
  children?: ReactNode | ((form: UseFormResult) => ReactNode);
  className?: string;
  style?: CSSProperties;
}

// ---------------------------------------------------------------------------
// Field context — carries the field name down to sub-components
// ---------------------------------------------------------------------------

interface FieldContextValue {
  name: string;
  fieldId: string;
  hintId: string;
  errorId: string;
}

const FieldContext = createContext<FieldContextValue | null>(null);

// ---------------------------------------------------------------------------
// FormStyled root
// ---------------------------------------------------------------------------

export const FormStyled = forwardRef<HTMLFormElement, FormStyledProps>(
  function FormStyled(
    {
      children,
      className,
      style,
      defaultValues,
      values,
      validate,
      validateOn,
      revalidateOn,
      onSubmit,
      onError,
    },
    ref
  ) {
    const form = useForm({
      defaultValues,
      values,
      validate,
      validateOn,
      revalidateOn,
      onSubmit,
      onError,
    });

    const { formState } = form;

    const dataAttrs: Record<string, string | undefined> = {};
    if (formState.isSubmitting) dataAttrs["data-submitting"] = "";
    if (formState.isValid) dataAttrs["data-valid"] = "";
    if (formState.isDirty) dataAttrs["data-dirty"] = "";

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
      form.handleSubmit(e);
    };

    return (
      <FormContext.Provider value={{ form }}>
        <form
          ref={ref}
          className={["rfrm-form", className].filter(Boolean).join(" ")}
          style={style}
          onSubmit={handleSubmit}
          noValidate
          aria-busy={formState.isSubmitting ? "true" : undefined}
          {...dataAttrs}
        >
          {typeof children === "function" ? children(form) : children}
        </form>
      </FormContext.Provider>
    );
  }
);

// ---------------------------------------------------------------------------
// Form.Field
// ---------------------------------------------------------------------------

export interface FormFieldProps {
  name: string;
  label?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

function FormField({
  name,
  label,
  hint,
  required,
  className,
  style,
  children,
}: FormFieldProps) {
  const { form } = useFormContext("Field");
  const fieldId = `rfrm-field-${name}`;
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;

  const error = form.formState.errors[name];
  const isTouched = form.formState.touchedFields[name];
  const isDirty = form.formState.dirtyFields[name];

  // Track when a new error appears so we can fire the shake animation
  const prevErrorRef = useRef<string | undefined>(undefined);
  const [justInvalid, setJustInvalid] = useState(false);

  useEffect(() => {
    if (error && !prevErrorRef.current) {
      setJustInvalid(true);
      const id = setTimeout(() => setJustInvalid(false), 400);
      prevErrorRef.current = error;
      return () => clearTimeout(id);
    }
    prevErrorRef.current = error;
  }, [error]);

  return (
    <FieldContext.Provider value={{ name, fieldId, hintId, errorId }}>
      <div
        className={["rfrm-field", className].filter(Boolean).join(" ")}
        style={style}
        data-invalid={error ? "true" : undefined}
        data-touched={isTouched ? "true" : undefined}
        data-dirty={isDirty ? "true" : undefined}
        data-just-invalid={justInvalid ? "true" : undefined}
      >
        {label && (
          <label className="rfrm-label" htmlFor={fieldId}>
            {label}
            {required && <span className="rfrm-required-mark" aria-hidden="true">*</span>}
          </label>
        )}
        {children}
        {hint && !error && (
          <span id={hintId} className="rfrm-hint">
            {hint}
          </span>
        )}
        {error && (
          <span id={errorId} className="rfrm-error" role="alert">
            {error}
          </span>
        )}
      </div>
    </FieldContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Form.Label
// ---------------------------------------------------------------------------

export interface FormLabelProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

function FormLabel({ children, className, style }: FormLabelProps) {
  const fieldCtx = useContext(FieldContext);
  return (
    <label
      className={["rfrm-label", className].filter(Boolean).join(" ")}
      style={style}
      htmlFor={fieldCtx?.fieldId}
    >
      {children}
    </label>
  );
}

// ---------------------------------------------------------------------------
// Form.Hint
// ---------------------------------------------------------------------------

export interface FormHintProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

function FormHint({ children, className, style }: FormHintProps) {
  const fieldCtx = useContext(FieldContext);
  return (
    <span
      id={fieldCtx?.hintId}
      className={["rfrm-hint", className].filter(Boolean).join(" ")}
      style={style}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Form.Error
// ---------------------------------------------------------------------------

export interface FormErrorProps {
  name?: string;
  className?: string;
  style?: CSSProperties;
}

function FormError({ name: nameProp, className, style }: FormErrorProps) {
  const { form } = useFormContext("Error");
  const fieldCtx = useContext(FieldContext);

  const fieldName = nameProp ?? fieldCtx?.name;
  const errorId = nameProp
    ? `rfrm-field-${nameProp}-error`
    : fieldCtx?.errorId;

  const error = fieldName ? form.formState.errors[fieldName] : undefined;

  if (!error) return null;

  return (
    <span
      id={errorId}
      className={["rfrm-error", className].filter(Boolean).join(" ")}
      style={style}
      role="alert"
    >
      {error}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Form.Submit
// ---------------------------------------------------------------------------

export interface FormSubmitProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
}

function FormSubmit({
  children = "Submit",
  className,
  style,
  disabled: disabledProp,
}: FormSubmitProps) {
  const { form } = useFormContext("Submit");
  const { isSubmitting } = form.formState;
  const isDisabled = disabledProp || isSubmitting;

  return (
    <button
      type="submit"
      className={["rfrm-submit", className].filter(Boolean).join(" ")}
      style={style}
      disabled={isDisabled}
      aria-busy={isSubmitting ? "true" : undefined}
    >
      {isSubmitting && (
        <span className="rfrm-submit-spinner" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Attach sub-components as static properties
// ---------------------------------------------------------------------------

FormStyled.displayName = "FormStyled";

const FormStyledWithSubcomponents = Object.assign(FormStyled, {
  Field: FormField,
  Label: FormLabel,
  Hint: FormHint,
  Error: FormError,
  Submit: FormSubmit,
});

export { FormStyledWithSubcomponents as Form };
