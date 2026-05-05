import {
  type ButtonHTMLAttributes,
  type ReactNode,
  forwardRef,
  useCallback,
} from "react";
import {
  type CopySource,
  type UseCopyToClipboardOptions,
  useCopyToClipboard,
} from "./useCopyToClipboard";

export interface CopyButtonRenderProps {
  copied: boolean;
  error: Error | null;
  copy: () => void;
}

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick" | "children" | "onCopy" | "onError"
>;

export interface CopyButtonProps
  extends NativeButtonProps,
    UseCopyToClipboardOptions {
  text: CopySource;
  children?: ReactNode | ((props: CopyButtonRenderProps) => ReactNode);
  /** Label rendered while in the copied state. */
  copiedLabel?: ReactNode;
  /** Label rendered when copy fails. */
  errorLabel?: ReactNode;
}

export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(
  function CopyButton(
    {
      text,
      children,
      copiedLabel,
      errorLabel,
      resetAfter,
      onCopy,
      onError,
      type = "button",
      ...rest
    },
    ref,
  ) {
    const { copy, copied, error } = useCopyToClipboard({
      resetAfter,
      onCopy,
      onError,
    });

    const handleClick = useCallback(() => {
      void copy(text);
    }, [copy, text]);

    if (typeof children === "function") {
      return <>{children({ copied, error, copy: handleClick })}</>;
    }

    const label =
      error && errorLabel !== undefined
        ? errorLabel
        : copied && copiedLabel !== undefined
          ? copiedLabel
          : children ?? "Copy";

    return (
      <button
        ref={ref}
        type={type}
        onClick={handleClick}
        data-copied={copied ? "true" : undefined}
        data-error={error ? "true" : undefined}
        aria-live="polite"
        {...rest}
      >
        {label}
      </button>
    );
  },
);
